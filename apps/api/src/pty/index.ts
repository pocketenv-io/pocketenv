import { consola } from "consola";
import type { Context } from "context";
import * as context from "context";
import { eq, or } from "drizzle-orm";
import express, { Router } from "express";
import { env } from "lib/env";
import jwt from "jsonwebtoken";
import schema from "schema";
import decrypt from "lib/decrypt";
import path from "node:path";
import crypto from "node:crypto";
import fs from "fs/promises";
import { createListener } from "./pty-tunnel";
import { Sandbox } from "@vercel/sandbox";
import type { Command } from "@vercel/sandbox";
import type { ListenerSocket } from "./pty-tunnel/websocket";
import { $ } from "zx";

const router = Router();
router.use((req, res, next) => {
  req.ctx = context.ctx;
  next();
});
router.use(express.json());

router.use((req, res, next) => {
  req.sandboxId = req.headers["x-sandbox-id"] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.split("Bearer ")[1]?.trim();
  if (bearer && bearer !== "null") {
    try {
      const credentials = jwt.verify(bearer, env.JWT_SECRET, {
        ignoreExpiration: true,
      }) as { did: string };

      req.did = credentials.did;
    } catch (err) {
      consola.error("Invalid JWT token:", err);
    }
  }

  next();
});

type Session = {
  socket: ListenerSocket;
  clients: Set<express.Response>;
};

const sessions = new Map<string, Session>();

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
    await $`bash -c "type /tmp/pty-tunnel-server || curl -L ${PTY_SERVER_DOWNLOAD_URL} | tar xz -C /tmp"`;

    consola.info("Uploading pty-tunnel server binary to sandbox", options.id);

    const pathname = path.join("/tmp", `pty-server-${crypto.randomUUID()}`);
    await sandbox.writeFiles([
      {
        path: pathname,
        content: await fs.readFile("/tmp/pty-tunnel-server"),
      },
    ]);

    consola.info("Setting up pty-tunnel server binary in sandbox", options.id);

    await sandbox.runCommand({
      cmd: "bash",
      args: [
        "-c",
        `mv "${pathname}" /usr/local/bin/${SERVER_BIN_NAME}; chmod +x /usr/local/bin/${SERVER_BIN_NAME}`,
      ],
      sudo: true,
    });

    consola.info("Pty-tunnel server binary set up in sandbox", options.id);
  }

  consola.info("Starting pty-tunnel server in sandbox", options.id);

  const cmd = await sandbox.runCommand({
    cmd: SERVER_BIN_NAME,
    args: [
      `--port=${PTY_PORT}`,
      `--mode=client`,
      `--cols=${process.stdout.columns ?? 80}`,
      `--rows=${process.stdout.rows ?? 24}`,
      "sh",
    ],
    env: {
      TERM,
      PS1: `▲ \\[\\e[2m\\]\\w/\\[\\e[0m\\] `,
    },
    detached: true,
  });

  consola.info("Sandbox environment set up for sandbox", options.id);

  return { sandbox, cmd };
}

async function createTerminalSession(ctx: Context, id: string) {
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
  };

  socket.addEventListener("message", async ({ data }) => {
    for (const res of session.clients) {
      res.write(`event: output\n`);
      res.write(
        `data: ${JSON.stringify({ data: data.toString("utf-8") })}\n\n`,
      );
    }
  });

  await socket.waitForOpen();
  socket.sendMessage({ type: "ready" });

  sessions.set(id, session);
  return session;
}

async function getSession(ctx: Context, id: string) {
  return sessions.get(id) ?? (await createTerminalSession(ctx, id));
}

router.get("/:id/stream", async (req, res) => {
  const { id } = req.params;
  const session = await getSession(req.ctx, id);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  session.clients.add(res);

  const keepAlive = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
    session.clients.delete(res);
  });
});

router.post("/:id/input", express.text({ type: "*/*" }), async (req, res) => {
  const { id } = req.params;
  const session = await getSession(req.ctx, id);

  const input = typeof req.body === "string" ? req.body : "";
  session.socket.sendMessage({
    type: "message",
    message: input,
  });

  res.status(204).end();
});

router.post("/:id/resize", async (req, res) => {
  const { id } = req.params;
  const session = await getSession(req.ctx, id);

  const cols = Number(req.body?.cols);
  const rows = Number(req.body?.rows);

  if (!Number.isInteger(cols) || !Number.isInteger(rows)) {
    res.status(400).json({ error: "Invalid cols/rows" });
    return;
  }

  session.socket.sendMessage({ type: "resize", cols, rows });
  res.status(204).end();
});

export default router;
