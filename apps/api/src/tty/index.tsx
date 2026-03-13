import { SpritesClient } from "@fly/sprites";
import { consola } from "consola";
import type { Context } from "context";
import * as context from "context";
import { eq } from "drizzle-orm";
import express, { Router } from "express";
import { env } from "lib/env";
import sandboxes from "schema/sandboxes";
import jwt from "jsonwebtoken";

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
  cmd: any;
  clients: Set<express.Response>;
};

const sessions = new Map<string, Session>();

async function createTerminalSession(ctx: Context, id: string) {
  const [sandbox] = await ctx.db
    .select()
    .from(sandboxes)
    .where(eq(sandboxes.id, id))
    .execute();

  if (!sandbox) {
    consola.error(`Sandbox not found: ${id}`);
    throw new Error(`Sandbox not found: ${id}`);
  }

  const client = new SpritesClient(env.SPRITE_TOKEN);
  const sprite = client.sprite(sandbox.sandbox_id!);
  const cmd = sprite.spawn("bash", [], {
    tty: true,
    rows: 24,
    cols: 80,
    env: {
      TERM: "xterm-256color",
    },
  });

  const session: Session = {
    cmd,
    clients: new Set(),
  };

  cmd.stdout.on("data", (chunk: Buffer | string) => {
    const data = chunk.toString("utf8");

    for (const res of session.clients) {
      res.write(`event: output\n`);
      res.write(`data: ${JSON.stringify({ data })}\n\n`);
    }
  });

  cmd.on?.("exit", (code: number) => {
    for (const res of session.clients) {
      res.write(`event: exit\n`);
      res.write(`data: ${JSON.stringify({ code })}\n\n`);
    }
    session.clients.clear();
    sessions.delete(id);
  });

  cmd.on?.("error", (err: Error) => {
    for (const res of session.clients) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: err.message })}\n\n`);
    }
    session.clients.clear();
    sessions.delete(id);
  });

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
  session.cmd.stdin.write(input);

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

  session.cmd.resize(cols, rows);
  res.status(204).end();
});

export default router;
