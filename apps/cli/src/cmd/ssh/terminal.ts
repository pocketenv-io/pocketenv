import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../../lib/getAccessToken";
import { env } from "../../lib/env";
import type { Sandbox } from "../../types/sandbox";
import { EventSource } from "eventsource";
import type { ErrorEvent } from "eventsource";
import axios from "axios";

async function sendInput(
  apiUrl: string,
  sessionId: string,
  data: string | Buffer,
  token: string,
): Promise<void> {
  try {
    await axios.post(
      `${apiUrl}/ssh/input/${sessionId}`,
      { data: data instanceof Buffer ? data.toString("utf-8") : data },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch {
    // session may have closed — swallow silently
  }
}

async function sendResize(
  apiUrl: string,
  sessionId: string,
  cols: number,
  rows: number,
  token: string,
): Promise<void> {
  try {
    await axios.post(
      `${apiUrl}/ssh/resize/${sessionId}`,
      { cols, rows },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch {
    // ignore transient resize errors
  }
}

function makeAuthFetch(
  token: string,
): (url: string | URL, init: RequestInit) => Promise<Response> {
  return (url: string | URL, init: RequestInit): Promise<Response> => {
    const headers = new Headers((init.headers as Record<string, string>) ?? {});
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  };
}

async function terminal(sandbox: Sandbox): Promise<void> {
  const token = await getAccessToken();
  const authToken = env.POCKETENV_TOKEN || token;
  const apiUrl = env.POCKETENV_API_URL;

  let cols = process.stdout.columns ?? 220;
  let rows = process.stdout.rows ?? 50;

  consola.info(
    `Connecting to ${chalk.cyanBright(sandbox.name)} via SSH…`,
  );

  let exiting = false;
  let es: EventSource | null = null;
  let sessionId: string | null = null;
  let stdinAttached = false;

  function teardown(code = 0): void {
    if (exiting) return;
    exiting = true;

    if (process.stdin.isTTY) {
      try {
        process.stdin.setRawMode(false);
      } catch {
        // ignore
      }
    }
    process.stdin.pause();

    if (es) {
      es.close();
      es = null;
    }

    if (sessionId) {
      const sid = sessionId;
      sessionId = null;
      axios
        .delete(`${apiUrl}/ssh/disconnect/${sid}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .catch(() => {});
    }

    process.exit(code);
  }

  function attachStdin(sid: string): void {
    if (stdinAttached) return;
    stdinAttached = true;

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    process.stdin.on("data", (chunk: Buffer) => {
      if (chunk.includes(0x0b)) {
        // Ctrl+K — local escape hatch
        teardown(0);
        return;
      }
      sendInput(apiUrl, sid, chunk, authToken);
    });

    process.stdout.on("resize", () => {
      cols = process.stdout.columns ?? cols;
      rows = process.stdout.rows ?? rows;
      sendResize(apiUrl, sid, cols, rows, authToken);
    });
  }

  process.stdout.write(`\x1b[35mConnecting to SSH session...\x1b[0m\r\n`);

  // Step 1: POST /ssh/connect to obtain a sessionId
  let connectResponse: { sessionId: string };
  try {
    const res = await axios.post<{ sessionId: string }>(
      `${apiUrl}/ssh/connect`,
      { cols, rows },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Sandbox-Id": sandbox.id,
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    connectResponse = res.data;
  } catch (err: unknown) {
    process.stdout.write("\r\x1b[K");
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? (err.response.data as { message?: string; error?: string })
            .message ??
          (err.response.data as { message?: string; error?: string }).error ??
          String(err)
        : String(err);
    process.stderr.write(
      `\x1b[38;5;203mSSH connection failed: ${message}\x1b[0m\r\n`,
    );
    process.exit(1);
  }

  sessionId = connectResponse.sessionId;

  // Erase the "Connecting…" line
  process.stdout.write("\r\x1b[K");

  // Step 2: open the SSE stream
  es = new EventSource(`${apiUrl}/ssh/stream/${sessionId}`, {
    fetch: makeAuthFetch(authToken),
  });

  es.addEventListener("connected", () => {
    const sid = sessionId!;
    sendResize(apiUrl, sid, cols, rows, authToken).then(() => {
      attachStdin(sid);
    });
  });

  // Default `message` events carry base64-encoded PTY output
  es.onmessage = (event: MessageEvent) => {
    try {
      const bytes = Buffer.from(event.data as string, "base64");
      process.stdout.write(bytes);
    } catch {
      process.stdout.write(event.data as string);
    }
  };

  es.addEventListener("close", () => {
    process.stderr.write(`\r\n${chalk.dim("SSH session closed.")}\r\n`);
    teardown(0);
  });

  es.onerror = (err: ErrorEvent) => {
    if (es && es.readyState === EventSource.CLOSED) {
      if (!err.message) {
        teardown(0);
      } else {
        process.stderr.write(
          `\r\n${chalk.red(`SSH connection lost (${err.message})`)}\r\n`,
        );
        teardown(1);
      }
    }
  };

  process.on("SIGINT", () => teardown(0));
  process.on("SIGTERM", () => teardown(0));

  await new Promise<void>((resolve) => {
    const poll = setInterval(() => {
      if (exiting) {
        clearInterval(poll);
        resolve();
      }
    }, 200);
  });
}

export default terminal;
