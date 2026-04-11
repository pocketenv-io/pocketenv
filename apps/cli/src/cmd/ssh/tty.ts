import WebSocket from "ws";
import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../../lib/getAccessToken";
import { env } from "../../lib/env";
import type { Sandbox } from "../../types/sandbox";

// ── Protocol ──────────────────────────────────────────────────────────────────
//
// Server → Client (WS at /tty/:id/ws or /pty/:id/ws):
//   - Text frame   raw PTY output, write directly to stdout
//   - Close        shell exited or session error
//
// Client → Server:
//   - Text frame   raw keystroke bytes (UTF-8)
//   - Text frame   JSON { type: "resize", cols: number, rows: number }

function toWsUrl(httpUrl: string, path: string, token: string): string {
  const base = httpUrl.replace(/^http(s?)/, (_, s) => `ws${s}`);
  const url = new URL(`${base}${path}`);
  url.searchParams.set("token", token);
  return url.toString();
}

async function ssh(sandbox: Sandbox, tty: boolean = false): Promise<void> {
  const token = await getAccessToken();
  const authToken = env.POCKETENV_TOKEN || token;

  const baseUrl = tty ? env.POCKETENV_TTY_URL : env.POCKETENV_PTY_URL;
  const wsUrl = toWsUrl(baseUrl, `/${sandbox.id}/ws`, authToken);
  consola.info(wsUrl);

  let cols = process.stdout.columns ?? 220;
  let rows = process.stdout.rows ?? 50;

  consola.info(
    `Connecting to ${chalk.cyanBright(sandbox.name)} via ${tty ? "TTY" : "PTY"} WebSocket…`,
  );

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

  process.stdout.write(`\x1b[35mConnecting to terminal...\x1b[0m\r\n`);

  ws.on("open", () => {
    process.stdout.write("\r\x1b[K");
    sendResize(cols, rows);
    attachStdin();
  });

  ws.on("message", (raw: WebSocket.RawData, isBinary: boolean) => {
    process.stdout.write(isBinary ? (raw as Buffer) : raw.toString("utf-8"));
  });

  ws.on("close", (code, reason) => {
    if (!exiting) {
      const msg = reason.length ? ` (${code} – ${reason})` : "";
      if (msg) {
        process.stderr.write(
          `\r\n${chalk.yellow("Connection closed")}${msg}\r\n`,
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

export default ssh;
