import WebSocket from "ws";
import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../../lib/getAccessToken";
import { client } from "../../client";
import { env } from "../../lib/env";
import type { Sandbox } from "../../types/sandbox";
import type { Profile } from "../../types/profile";

// ── Protocol (mirrors @cloudflare/sandbox xterm addon) ───────────────────────
//
// Server → Client:
//   - Binary frame   raw PTY output (UTF-8 bytes), write directly to stdout
//   - Text frame     JSON control message:
//       { type: "ready" }                  session is live
//       { type: "error", message: string } terminal error
//       { type: "exit",  code: number }    remote shell exited
//
// Client → Server:
//   - Binary frame   raw keystroke bytes (UTF-8) — same as TextEncoder output
//   - Text frame     { type: "resize", cols: number, rows: number }

type ControlMessage =
  | { type: "ready" }
  | { type: "error"; message: string }
  | { type: "exit"; code: number; signal?: string };

function sendInput(ws: WebSocket, data: Buffer): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(data);
  }
}

function sendResize(ws: WebSocket, cols: number, rows: number): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "resize", cols, rows }));
  }
}

/**
 * Resolve the Cloudflare worker URL for a given baseSandbox (template) name.
 *
 * The web app constructs the URL with:
 *   CF_URL.replace("sbx", worker).replace("claude-code", "claudecode")
 *
 * The production CF_URL is "https://sbx.pocketenv.io", so for a worker named
 * "claude-code" the final URL becomes "https://claudecode.pocketenv.io".
 */
function resolveWorkerUrl(baseSandbox: string, cfUrl: string): string {
  return cfUrl.replace("sbx", baseSandbox).replace("claude-code", "claudecode");
}

async function ssh(sandbox: Sandbox) {
  const token = await getAccessToken();
  const authToken = env.POCKETENV_TOKEN || token;

  const tokenResponse = await client.get<{ token?: string }>(
    "/xrpc/io.pocketenv.actor.getTerminalToken",
    { headers: { Authorization: `Bearer ${authToken}` } },
  );

  const terminalToken = tokenResponse.data.token;
  if (!terminalToken) {
    consola.error("Failed to obtain a terminal token.");
    process.exit(1);
  }

  const cfBaseUrl = env.POCKETENV_CF_URL;
  const workerUrl = resolveWorkerUrl(sandbox.baseSandbox, cfBaseUrl);

  // Convert http(s) → ws(s)
  const wsBase = workerUrl.replace(/^http/, "ws");
  const wsUrl = new URL(`${wsBase}/v1/sandboxes/${sandbox.id}/ws/terminal`);
  wsUrl.searchParams.set("t", terminalToken);
  wsUrl.searchParams.set("session", crypto.randomUUID());

  let cols = process.stdout.columns ?? 220;
  let rows = process.stdout.rows ?? 50;

  consola.info(
    `Connecting to ${chalk.cyanBright(sandbox.name)} via Cloudflare sandbox…`,
  );

  // Use default binaryType ("nodebuffer") so binary frames arrive as Buffer,
  // which is what isBinary:true + Buffer.isBuffer() correctly identifies.
  const ws = new WebSocket(wsUrl.toString(), {
    headers: { "User-Agent": "pocketenv-cli" },
  });

  let exiting = false;
  let stdinAttached = false;

  function teardown(code = 0): void {
    if (exiting) return;
    exiting = true;

    if (process.stdin.isTTY) {
      try {
        process.stdin.setRawMode(false);
      } catch {
        // ignore – may already be restored
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

  ws.on("open", () => {
    // Nothing to do on open — wait for "ready" before sending resize or input.
    // (Matches the xterm addon behaviour: onSocketOpen only registers listeners,
    //  sendResize is called from handleControlMessage("ready").)
  });

  ws.on("message", (raw: WebSocket.RawData, isBinary: boolean) => {
    if (isBinary) {
      // Raw PTY output — write the bytes directly to stdout unchanged.
      // raw is a Buffer (default nodebuffer binaryType).
      process.stdout.write(raw as Buffer);
      return;
    }

    // Text frame → JSON control message.
    let msg: ControlMessage;
    try {
      msg = JSON.parse(raw.toString()) as ControlMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case "ready": {
        // ── Session is live ──────────────────────────────────────────────
        // 1. Send current terminal dimensions now that the PTY is ready.
        sendResize(ws, cols, rows);

        if (stdinAttached) break;
        stdinAttached = true;

        // 2. Switch stdin to raw mode — every keystroke is forwarded
        //    immediately, no local echo or line-buffering.
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(true);
        }
        // Keep stdin flowing as a raw binary stream. Using no encoding
        // means data events fire with Buffer objects, which we send
        // directly as binary WebSocket frames — no encoding round-trip.
        process.stdin.resume();

        // stdin → WebSocket (binary frame, UTF-8 bytes)
        process.stdin.on("data", (chunk: Buffer) => {
          sendInput(ws, chunk);
        });

        // Terminal resize → notify the remote PTY.
        process.stdout.on("resize", () => {
          cols = process.stdout.columns ?? cols;
          rows = process.stdout.rows ?? rows;
          sendResize(ws, cols, rows);
        });

        break;
      }

      case "error":
        process.stderr.write(
          `\r\n${chalk.red("Terminal error:")} ${msg.message}\r\n`,
        );
        teardown(1);
        break;

      case "exit":
        process.stderr.write(
          `\r\n${chalk.dim(
            `Session exited with code ${msg.code}${msg.signal ? ` (${msg.signal})` : ""}`,
          )}\r\n`,
        );
        teardown(msg.code ?? 0);
        break;
    }
  });

  ws.on("close", (code, reason) => {
    if (!exiting) {
      process.stderr.write(
        `\r\n${chalk.yellow("Connection closed")} (${code}${reason.length ? ` – ${reason}` : ""})\r\n`,
      );
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
