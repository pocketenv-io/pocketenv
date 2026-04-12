import { consola } from "consola";
import type { Context, Session } from "context";
import { eq, or } from "drizzle-orm";
import decrypt from "lib/decrypt";
import { createListener } from "pty/pty-tunnel";
import schema from "schema";
import { Sandbox } from "@vercel/sandbox";
import type { Command } from "@vercel/sandbox";
import { $ } from "zx";
import chalk from "chalk";
import crypto from "crypto";
import fs from "fs/promises";
import path from "node:path";

const TERM = "xterm-256color";
const PTY_SERVER_DOWNLOAD_URL =
  "https://github.com/tsirysndr/pty-tunnel-server/releases/download/v0.0.2/pty-server-linux-x86_64.tar.gz";
const SERVER_BIN_NAME = "pty-tunnel-server";
const PTY_PORT = 26661;

type SandboxEnvironmentOptions = {
  id: string;
  vercelApiToken: string;
  vercelProjectId: string;
  vercelTeamId: string;
};

async function checkIfServerInstalled(sandbox: Sandbox) {
  const exists = await sandbox.runCommand({
    cmd: "command",
    args: ["-v", SERVER_BIN_NAME],
  });
  return exists.exitCode === 0;
}

async function setupSandboxEnvironment(
  options: SandboxEnvironmentOptions,
): Promise<{ sandbox: Sandbox; cmd: Command }> {
  const sandbox = await Sandbox.get({
    sandboxId: options.id,
    token: options.vercelApiToken,
    projectId: options.vercelProjectId,
    teamId: options.vercelTeamId,
  });

  if (!(await checkIfServerInstalled(sandbox))) {
    await $`bash -c "type /tmp/${SERVER_BIN_NAME} || curl -L ${PTY_SERVER_DOWNLOAD_URL} | tar xz -C /tmp"`;

    consola.info(
      "Uploading pty-tunnel server binary to sandbox",
      chalk.greenBright(options.id),
    );

    const pathname = path.join("/tmp", `pty-server-${crypto.randomUUID()}`);
    await sandbox.writeFiles([
      {
        path: pathname,
        content: await fs.readFile(`/tmp/${SERVER_BIN_NAME}`),
      },
    ]);

    consola.info(
      "Setting up pty-tunnel server binary in sandbox",
      chalk.greenBright(options.id),
    );

    await sandbox.runCommand({
      cmd: "bash",
      args: [
        "-c",
        `mv "${pathname}" /usr/local/bin/${SERVER_BIN_NAME}; chmod +x /usr/local/bin/${SERVER_BIN_NAME}`,
      ],
      sudo: true,
    });

    consola.info(
      "Pty-tunnel server binary set up in sandbox",
      chalk.greenBright(options.id),
    );
  }

  consola.info(
    "Starting pty-tunnel server in sandbox",
    chalk.greenBright(options.id),
  );

  const cmd = await sandbox.runCommand({
    cmd: SERVER_BIN_NAME,
    args: [
      `--port=${PTY_PORT}`,
      `--mode=client`,
      `--cols=${process.stdout.columns ?? 80}`,
      `--rows=${process.stdout.rows ?? 24}`,
      "bash",
    ],
    env: {
      TERM,
      PS1: `▲ \\[\\e[2m\\]\\w/\\[\\e[0m\\] `,
    },
    detached: true,
  });

  consola.info(
    "Sandbox environment set up for sandbox",
    chalk.greenBright(options.id),
  );

  return { sandbox, cmd };
}

export async function createTerminalSession(ctx: Context, id: string, key = id) {
  const [record] = await ctx.db
    .select()
    .from(schema.sandboxes)
    .leftJoin(
      schema.vercelAuth,
      eq(schema.vercelAuth.sandboxId, schema.sandboxes.id),
    )
    .where(or(eq(schema.sandboxes.id, id), eq(schema.sandboxes.sandboxId, id)))
    .execute();

  if (!record?.vercel_auth) {
    consola.error("Vercel auth not found for sandbox", { id });
    throw new Error("Vercel auth not found for sandbox " + id);
  }

  if (!record.sandboxes.sandboxId) {
    consola.error("Sandbox ID not found for sandbox", { id });
    throw new Error("Sandbox ID not found for sandbox " + id);
  }

  const { sandbox, cmd } = await setupSandboxEnvironment({
    id: record.sandboxes.sandboxId,
    vercelApiToken: decrypt(record.vercel_auth.vercelToken),
    vercelProjectId: record.vercel_auth.projectId,
    vercelTeamId: record.vercel_auth.teamId,
  });

  const listener = createListener();

  // Pipe the pty-tunnel-server's stdout into the listener so
  // readConnectionInfo() can parse the JSON connection handshake.
  // We also accept stderr in case the binary writes there instead.
  (async () => {
    for await (const log of cmd.logs()) {
      consola.debug(`pty-tunnel-server [${log.stream}]:`, log.data.trimEnd());
      if (log.stream === "stdout") {
        // jsonlines parser requires newline-terminated data
        const data = log.data.endsWith("\n") ? log.data : log.data + "\n";
        listener.stdoutStream.write(data);
      }
    }
    listener.stdoutStream.end();
  })().catch((err) =>
    consola.error("pty-tunnel-server log stream error:", err),
  );

  const details = await listener.connection;
  const url =
    `wss://${sandbox.domain(PTY_PORT).replace(/^https?:\/\//, "")}` as const;
  consola.info("Connecting to WebSocket URL:", url);

  const socket = details.createClient(url);

  const session: Session = {
    socket,
    clients: new Set(),
    wsClients: new Set(),
  };

  socket.addEventListener("message", async ({ data }) => {
    const text = data.toString("utf-8");
    for (const res of session.clients) {
      res.write(`event: output\n`);
      res.write(`data: ${JSON.stringify({ data: text })}\n\n`);
    }
    for (const ws of session.wsClients) {
      if (ws.readyState === ws.OPEN) ws.send(text);
    }
  });

  socket.addEventListener("close", () => {
    ctx.sessions.delete(key);
    for (const ws of session.wsClients) {
      if (ws.readyState === ws.OPEN) ws.close(1000, "exit");
    }
    session.clients.clear();
    session.wsClients.clear();
  });

  await socket.waitForOpen();
  socket.sendMessage({ type: "ready" });

  ctx.sessions.set(key, session);
  return session;
}
