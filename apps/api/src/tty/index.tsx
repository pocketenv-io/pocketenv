import { SpritesClient } from "@fly/sprites";
import express, { Router } from "express";
import { env } from "lib/env";

const router = Router();
router.use(express.json());

type Session = {
  cmd: any;
  clients: Set<express.Response>;
};

const sessions = new Map<string, Session>();

function createTerminalSession(id: string) {
  const client = new SpritesClient(env.SPRITE_TOKEN);
  const sprite = client.sprite(env.SPRITE_NAME);
  const cmd = sprite.spawn("bash", [], {
    tty: true,
    rows: 24,
    cols: 80,
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

  sessions.set(id, session);
  return session;
}

function getSession(id: string) {
  return sessions.get(id) ?? createTerminalSession(id);
}

router.get("/:id/stream", (req, res) => {
  const { id } = req.params;
  const session = getSession(id);

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

router.post("/:id/input", express.text({ type: "*/*" }), (req, res) => {
  const { id } = req.params;
  const session = getSession(id);

  const input = typeof req.body === "string" ? req.body : "";
  session.cmd.stdin.write(input);

  res.status(204).end();
});

router.post("/:id/resize", (req, res) => {
  const { id } = req.params;
  const session = getSession(id);

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
