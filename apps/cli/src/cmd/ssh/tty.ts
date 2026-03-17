import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../../lib/getAccessToken";
import { env } from "../../lib/env";
import type { Sandbox } from "../../types/sandbox";
import { EventSource } from "eventsource";
import type { ErrorEvent } from "eventsource";
import axios from "axios";

// ── Protocol (mirrors TtyTerminal web component) ──────────────────────────────
//
// Server → Client (SSE stream at GET /tty/:id/stream):
//   event: output   data: { "data": "<string>" }   raw PTY output chunk
//   event: exit     data: { "code": <number> }      remote shell exited
//
// Client → Server:
//   POST /tty/:id/input   Content-Type: text/plain         raw keystroke bytes
//   POST /tty/:id/resize  Content-Type: application/json   { cols, rows }

async function sendInput(
  ttyUrl: string,
  sandboxId: string,
  data: string | Buffer,
  token: string,
): Promise<void> {
  try {
    await axios.post(
      `${ttyUrl}/tty/${sandboxId}/input`,
      data instanceof Buffer ? data.toString("utf-8") : data,
      {
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch {
    // session may have closed — swallow the error silently
  }
}

async function sendResize(
  ttyUrl: string,
  sandboxId: string,
  cols: number,
  rows: number,
  token: string,
): Promise<void> {
  try {
    await axios.post(
      `${ttyUrl}/tty/${sandboxId}/resize`,
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

/**
 * Build a custom fetch function that injects the Authorization header into
 * every SSE request.  The eventsource v3 package uses a fetch-based
 * implementation and exposes this hook via `EventSourceInit.fetch`.
 */
function makeAuthFetch(
  token: string,
): (url: string | URL, init: RequestInit) => Promise<Response> {
  return (url: string | URL, init: RequestInit): Promise<Response> => {
    const headers = new Headers((init.headers as Record<string, string>) ?? {});
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  };
}

async function ssh(sandbox: Sandbox): Promise<void> {
  const token = await getAccessToken();
  const authToken = env.POCKETENV_TOKEN || token;

  const ttyUrl = env.POCKETENV_TTY_URL;

  let cols = process.stdout.columns ?? 220;
  let rows = process.stdout.rows ?? 50;

  consola.info(
    `Connecting to ${chalk.cyanBright(sandbox.name)} via TTY stream…`,
  );

  let exiting = false;
  let es: EventSource | null = null;
  let stdinAttached = false;

  function teardown(code = 0): void {
    if (exiting) return;
    exiting = true;

    if (process.stdin.isTTY) {
      try {
        process.stdin.setRawMode(false);
      } catch {
        // ignore – may already be restored by the time teardown runs
      }
    }
    process.stdin.pause();

    if (es) {
      es.close();
      es = null;
    }

    process.exit(code);
  }

  function attachStdin(): void {
    if (stdinAttached) return;
    stdinAttached = true;

    // Switch stdin to raw mode — every keystroke is forwarded immediately,
    // with no local echo or line-buffering.
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    // Keep stdin flowing as a raw binary stream.
    process.stdin.resume();

    // stdin → POST /tty/:id/input
    // In raw mode the OS never raises SIGINT — Ctrl+C arrives as a raw byte
    // in the data stream and is forwarded to the remote shell as-is.
    // We use Ctrl+K (\x0b) as a local-only escape hatch to avoid conflicting
    // with Ctrl+C semantics inside the remote shell.
    process.stdin.on("data", (chunk: Buffer) => {
      if (chunk.includes(0x0b)) {
        // Ctrl+K pressed — tear down immediately without waiting for the server.
        teardown(0);
        return;
      }
      sendInput(ttyUrl, sandbox.id, chunk, authToken);
    });

    // Terminal resize → notify the remote PTY.
    process.stdout.on("resize", () => {
      cols = process.stdout.columns ?? cols;
      rows = process.stdout.rows ?? rows;
      sendResize(ttyUrl, sandbox.id, cols, rows, authToken);
    });
  }

  // Mirror TtyTerminal: print a magenta "Connecting…" hint before the stream
  // opens, then erase it once the `open` event fires.
  process.stdout.write(`\x1b[35mConnecting to terminal...\x1b[0m\r\n`);

  // Open the SSE stream.
  // eventsource v3 is fetch-based, so we inject the Authorization header via
  // a custom fetch implementation instead of an `headers` init option.
  es = new EventSource(`${ttyUrl}/tty/${sandbox.id}/stream`, {
    fetch: makeAuthFetch(authToken),
  });

  es.addEventListener("open", () => {
    // Erase the "Connecting…" line (carriage-return + erase-to-end-of-line),
    // exactly as TtyTerminal does with `instance.write("\r\x1b[K")`.
    process.stdout.write("\r\x1b[K");

    // Sync terminal dimensions immediately after connecting, then attach stdin.
    sendResize(ttyUrl, sandbox.id, cols, rows, authToken).then(() => {
      attachStdin();
    });
  });

  // `event: output`  data: { "data": "..." }
  es.addEventListener("output", (event: MessageEvent) => {
    try {
      const { data } = JSON.parse(event.data as string) as { data: string };
      process.stdout.write(data);
    } catch {
      // Fall back to writing the raw SSE data if the JSON wrapper is absent.
      process.stdout.write(event.data as string);
    }
  });

  // `event: exit`  data: { "code": <number> }
  es.addEventListener("exit", (event: MessageEvent) => {
    let code = 0;
    try {
      const parsed = JSON.parse(event.data as string) as { code: number };
      code = parsed.code ?? 0;
      process.stderr.write(
        `\r\n${chalk.dim(`Process exited with code ${code}`)}\r\n`,
      );
    } catch {
      process.stderr.write(`\r\n${chalk.dim("Process exited.")}\r\n`);
    }
    teardown(code);
  });

  // `onerror` receives an `ErrorEvent` (eventsource v3 type).
  // readyState === 2 (CLOSED) means the stream is gone and the client will
  // NOT auto-retry.  readyState === 0 (CONNECTING) is an auto-retry — let it.
  es.onerror = (err: ErrorEvent) => {
    // The eventsource package exposes readyState on the EventSource instance.
    if (es && es.readyState === EventSource.CLOSED) {
      // If the shell exited cleanly the server will close the SSE stream with
      // no error message.  Treat a message-less close as a graceful exit (code
      // 0) rather than a connection error, so the user isn't shown a red
      // "connection lost" banner after a normal `exit`.
      if (!err.message) {
        teardown(0);
      } else {
        process.stderr.write(
          `\r\n${chalk.red(`Terminal connection lost (${err.message})`)}\r\n`,
        );
        teardown(1);
      }
    }
  };

  process.on("SIGINT", () => teardown(0));
  process.on("SIGTERM", () => teardown(0));

  // Block until teardown() fires (which calls process.exit, but the Promise
  // is here as a safety net for future refactors that remove process.exit).
  await new Promise<void>((resolve) => {
    const poll = setInterval(() => {
      if (exiting) {
        clearInterval(poll);
        resolve();
      }
    }, 200);
  });
}

export default ssh;
