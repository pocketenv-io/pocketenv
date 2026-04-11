import WebSocket from "ws";
import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../../lib/getAccessToken";
import { env } from "../../lib/env";
import type { Sandbox } from "../../types/sandbox";
import axios from "axios";

// ── Protocol ──────────────────────────────────────────────────────────────────
//
// Step 1: POST /ssh/connect  → { sessionId }
//
// Step 2: WS at /ssh/:sessionId/ws
//   Server → Client:
//     - Text frame   base64-encoded PTY output
//     - Close        SSH session ended
//
//   Client → Server:
//     - Text frame   raw keystroke bytes (UTF-8)
//     - Text frame   JSON { type: "resize", cols: number, rows: number }

function toWsUrl(httpUrl: string, path: string, token: string): string {
  const base = httpUrl.replace(/^http(s?)/, (_, s) => `ws${s}`);
  const url = new URL(`${base}${path}`);
  url.searchParams.set("token", token);
  return url.toString();
}

async function terminal(sandbox: Sandbox): Promise<void> {
  const token = await getAccessToken();
  const authToken = env.POCKETENV_TOKEN || token;
  const apiUrl = env.POCKETENV_API_URL;

  let cols = process.stdout.columns ?? 220;
  let rows = process.stdout.rows ?? 50;

  consola.info(`Connecting to ${chalk.cyanBright(sandbox.name)} via SSH…`);

  process.stdout.write(`\x1b[35mConnecting to SSH session...\x1b[0m\r\n`);

  // Step 1: create the SSH session
  let sessionId: string;
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
    sessionId = res.data.sessionId;
  } catch (err: unknown) {
    process.stdout.write("\r\x1b[K");
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? (err.response.data as { message?: string; error?: string }).message ??
          (err.response.data as { message?: string; error?: string }).error ??
          String(err)
        : String(err);
    process.stderr.write(
      `\x1b[38;5;203mSSH connection failed: ${message}\x1b[0m\r\n`,
    );
    process.exit(1);
  }

  // Step 2: open WebSocket to /ssh/:sessionId/ws
  const wsUrl = toWsUrl(apiUrl, `/ssh/${sessionId}/ws`, authToken);
  const ws = new WebSocket(wsUrl, {
    headers: { "User-Agent": "pocketenv-cli" },
  });

  let exiting = false;
  let stdinAttached = false;

  function sendResize(c: number, r: number): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "resize", cols: c, rows: r }));
    }
  }

  function teardown(code = 0): void {
    if (exiting) return;
    exiting = true;

    if (process.stdin.isTTY) {
      try {
        process.stdin.setRawMode(false);
      } catch {
        // already restored
      }
    }
    process.stdin.pause();

    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    ) {
      ws.close(1000, "client disconnect");
    }

    axios
      .delete(`${apiUrl}/ssh/disconnect/${sessionId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .catch(() => {});

    process.exit(code);
  }

  function attachStdin(): void {
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
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(chunk.toString("utf-8"));
      }
    });

    process.stdout.on("resize", () => {
      cols = process.stdout.columns ?? cols;
      rows = process.stdout.rows ?? rows;
      sendResize(cols, rows);
    });
  }

  ws.on("open", () => {
    process.stdout.write("\r\x1b[K");
    sendResize(cols, rows);
    attachStdin();
  });

  ws.on("message", (raw: WebSocket.RawData, isBinary: boolean) => {
    if (isBinary) {
      process.stdout.write(raw as Buffer);
      return;
    }
    // base64-encoded SSH output
    try {
      const bytes = Buffer.from(raw.toString(), "base64");
      process.stdout.write(bytes);
    } catch {
      process.stdout.write(raw.toString());
    }
  });

  ws.on("close", (code, reason) => {
    if (!exiting) {
      process.stderr.write(`\r\n${chalk.dim("SSH session closed.")}\r\n`);
      if (reason.length) {
        process.stderr.write(
          `${chalk.yellow("Connection closed")} (${code} – ${reason})\r\n`,
        );
      }
      teardown(0);
    }
  });

  ws.on("error", (err: Error) => {
    consola.error("WebSocket error:", err.message);
    teardown(1);
  });

  process.on("SIGINT", () => teardown(0));
  process.on("SIGTERM", () => teardown(0));

  await new Promise<void>((resolve) => {
    ws.on("close", resolve);
    ws.on("error", () => resolve());
  });
}

export default terminal;
