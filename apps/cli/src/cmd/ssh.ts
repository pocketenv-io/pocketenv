import WebSocket from "ws";
import * as pty from "node-pty";
import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../lib/getAccessToken";
import { client } from "../client";
import { env } from "../lib/env";
import type { Sandbox } from "../types/sandbox";
import type { Profile } from "../types/profile";
import type { RawData } from "ws";

type ServerMessage =
  | { type: "connected"; sessionId: string }
  | { type: "output"; data: string }
  | { type: "error"; message: string };

type ClientMessage =
  | { type: "input"; data: string }
  | { type: "resize"; cols: number; rows: number };

function send(ws: WebSocket, msg: ClientMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
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
 * We replicate that logic here.
 */
function resolveWorkerUrl(baseSandbox: string, cfUrl: string): string {
  return cfUrl.replace("sbx", baseSandbox).replace("claude-code", "claudecode");
}

async function ssh(sandboxName: string | undefined) {
  const token = await getAccessToken();
  const authToken = env.POCKETENV_TOKEN || token;

  let sandbox: Sandbox;

  if (!sandboxName) {
    const profile = await client.get<Profile>(
      "/xrpc/io.pocketenv.actor.getProfile",
      { headers: { Authorization: `Bearer ${authToken}` } },
    );

    const response = await client.get<{ sandboxes: Sandbox[] }>(
      "/xrpc/io.pocketenv.actor.getActorSandboxes",
      {
        params: { did: profile.data.did, offset: 0, limit: 100 },
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    const runningSandboxes = response.data.sandboxes.filter(
      (s) => s.status === "RUNNING" && s.provider === "cloudflare",
    );

    if (runningSandboxes.length === 0) {
      consola.error(
        `No running Cloudflare sandboxes found. ` +
          `Start one with ${chalk.greenBright("pocketenv start <sandbox>")} first.`,
      );
      process.exit(1);
    }

    sandbox = runningSandboxes[0] as Sandbox;
    consola.info(`Connecting to sandbox ${chalk.greenBright(sandbox.name)}…`);
  } else {
    const response = await client.get<{ sandbox: Sandbox | null }>(
      "/xrpc/io.pocketenv.sandbox.getSandbox",
      {
        params: { id: sandboxName },
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    if (!response.data.sandbox) {
      consola.error(`Sandbox ${chalk.yellowBright(sandboxName)} not found.`);
      process.exit(1);
    }

    sandbox = response.data.sandbox;
  }

  if (sandbox.provider !== "cloudflare") {
    consola.error(
      `Sandbox ${chalk.yellowBright(sandbox.name)} uses provider ` +
        `${chalk.cyan(sandbox.provider)}, but this command only supports ` +
        `${chalk.cyan("cloudflare")} sandboxes.`,
    );
    process.exit(1);
  }

  if (sandbox.status !== "RUNNING") {
    consola.error(
      `Sandbox ${chalk.yellowBright(sandbox.name)} is not running. ` +
        `Start it with ${chalk.greenBright(`pocketenv start ${sandbox.name}`)}.`,
    );
    process.exit(1);
  }

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

  const wsBase = workerUrl.replace(/^http/, "ws");

  const wsUrl = new URL(`${wsBase}/v1/sandboxes/${sandbox.id}/ws/terminal`);
  wsUrl.searchParams.set("t", terminalToken);

  const cols = process.stdout.columns ?? 220;
  const rows = process.stdout.rows ?? 50;

  // We spawn a minimal shell just to own the PTY file descriptor for resizing
  // purposes.  All real I/O is forwarded over the WebSocket – the local PTY is
  // only used so we can put stdin into raw mode and track SIGWINCH.
  const localPty = pty.spawn(
    process.platform === "win32" ? "cmd.exe" : "sh",
    [],
    {
      name: "xterm-256color",
      cols,
      rows,
      cwd: process.env.HOME ?? process.cwd(),
      env: process.env as Record<string, string>,
    },
  );

  consola.info(
    `Connecting to ${chalk.cyanBright(sandbox.name)} via Cloudflare sandbox…`,
  );

  const ws = new WebSocket(wsUrl.toString(), {
    headers: { "User-Agent": "pocketenv-cli" },
  });

  let exiting = false;

  function teardown(code = 0) {
    if (exiting) return;
    exiting = true;

    // Restore terminal state.
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      try {
        process.stdin.setRawMode(false);
      } catch {
        // ignore
      }
    }
    process.stdin.resume();

    try {
      localPty.kill();
    } catch {
      // already dead
    }

    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    ) {
      ws.close(1000, "client disconnect");
    }

    process.exit(code);
  }

  ws.on("open", () => {
    send(ws, { type: "resize", cols, rows });
  });

  ws.on("message", (raw: RawData) => {
    let msg: ServerMessage;
    try {
      msg = JSON.parse(raw.toString()) as ServerMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case "connected":
        if (process.stdin.isTTY && process.stdin.setRawMode) {
          process.stdin.setRawMode(true);
        }
        process.stdin.resume();

        process.stdin.on("data", (chunk: Buffer) => {
          const data = chunk.toString("binary");
          // Ctrl-C / Ctrl-D / Ctrl-Z are forwarded as-is; the remote shell
          // handles them.  We only intercept nothing here.
          send(ws, { type: "input", data });
        });

        process.on("SIGWINCH", () => {
          const newCols = process.stdout.columns ?? cols;
          const newRows = process.stdout.rows ?? rows;
          try {
            localPty.resize(newCols, newRows);
          } catch {
            // ignore
          }
          send(ws, { type: "resize", cols: newCols, rows: newRows });
        });
        break;

      case "output":
        // Remote PTY output → local stdout
        process.stdout.write(msg.data);
        break;

      case "error":
        process.stderr.write(
          `\r\n${chalk.red("Terminal error:")} ${msg.message}\r\n`,
        );
        teardown(1);
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

  // Prevent node from exiting while the WebSocket is open.
  await new Promise<void>((resolve) => {
    ws.on("close", resolve);
    ws.on("error", () => resolve());
  });
}

export default ssh;
