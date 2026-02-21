import express, { Router } from "express";
import { Client } from "ssh2";
import { randomUUID } from "node:crypto";
import { consola } from "consola";
import jwt from "jsonwebtoken";
import { env } from "lib/env";
import generateJwt from "lib/generateJwt";

interface SSHSession {
  client: Client;
  stream: NodeJS.ReadWriteStream | null;
  sseRes: import("express").Response | null;
}

const sessions = new Map<string, SSHSession>();

const router = Router();

router.use(express.json());

router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.split("Bearer ")[1]?.trim();
  if (bearer && bearer !== "null") {
    const credentials = jwt.verify(bearer, env.JWT_SECRET, {
      ignoreExpiration: true,
    }) as { did: string };

    req.did = credentials.did;
    req.sandboxId = req.headers["x-sandbox-id"] as string | undefined;
  }

  next();
});

/**
 * POST /ssh/connect
 * Creates a new SSH session and returns the sessionId.
 * Optionally accepts { cols, rows } in the body.
 */
router.post("/ssh/connect", async (req, res) => {
  const sessionId = randomUUID();
  const cols = req.body?.cols || 80;
  const rows = req.body?.rows || 24;
  consola.log(req.did);
  consola.log(req.sandboxId);

  const ssh = await req.ctx.sandbox.get(`/v1/sandboxes/${req.sandboxId}/ssh`, {
    headers: {
      ...(req.did && {
        Authorization: `Bearer ${await generateJwt(req.did)}`,
      }),
    },
  });

  console.log(ssh);

  const client = new Client();

  const session: SSHSession = {
    client,
    stream: null,
    sseRes: null,
  };

  sessions.set(sessionId, session);

  client.on("ready", () => {
    consola.success(`SSH session ${sessionId} connected`);

    client.shell({ cols, rows, term: "xterm-256color" }, (err, stream) => {
      if (err) {
        consola.error(`SSH shell error for session ${sessionId}:`, err);
        sessions.delete(sessionId);
        res.status(500).json({ error: "Failed to open shell" });
        return;
      }

      session.stream = stream;

      stream.on("data", (data: Buffer) => {
        if (session.sseRes && !session.sseRes.writableEnded) {
          const encoded = Buffer.from(data).toString("base64");
          session.sseRes.write(`data: ${encoded}\n\n`);
        }
      });

      stream.on("close", () => {
        consola.info(`SSH stream closed for session ${sessionId}`);
        if (session.sseRes && !session.sseRes.writableEnded) {
          session.sseRes.write(`event: close\ndata: closed\n\n`);
          session.sseRes.end();
        }
        client.end();
        sessions.delete(sessionId);
      });

      stream.stderr.on("data", (data: Buffer) => {
        if (session.sseRes && !session.sseRes.writableEnded) {
          const encoded = Buffer.from(data).toString("base64");
          session.sseRes.write(`data: ${encoded}\n\n`);
        }
      });

      res.json({ sessionId });
    });
  });

  client.on("error", (err) => {
    consola.error(`SSH connection error for session ${sessionId}:`, err);
    if (session.sseRes && !session.sseRes.writableEnded) {
      session.sseRes.write(
        `event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`,
      );
      session.sseRes.end();
    }
    sessions.delete(sessionId);
    // Only respond if headers haven't been sent
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "SSH connection failed", message: err.message });
    }
  });

  client.connect({
    host: ssh.data?.hostname,
    port: 22,
    username: ssh.data?.username,
  });
});

/**
 * GET /ssh/stream/:sessionId
 * SSE endpoint that streams SSH output to the client.
 */
router.get("/ssh/stream/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Send initial connected event
  res.write(`event: connected\ndata: ${sessionId}\n\n`);

  session.sseRes = res;

  // Handle client disconnect
  req.on("close", () => {
    consola.info(`SSE client disconnected for session ${sessionId}`);
    session.sseRes = null;
  });
});

/**
 * POST /ssh/input/:sessionId
 * Sends keyboard input to the SSH session.
 * Body: { data: string }
 */
router.post("/ssh/input/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session || !session.stream) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const { data } = req.body;
  if (data) {
    session.stream.write(data);
  }

  res.json({ ok: true });
});

/**
 * POST /ssh/resize/:sessionId
 * Resizes the SSH terminal.
 * Body: { cols: number, rows: number }
 */
router.post("/ssh/resize/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session || !session.stream) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const { cols, rows } = req.body;
  if (cols && rows) {
    (session.stream as any).setWindow(rows, cols, 0, 0);
  }

  res.json({ ok: true });
});

/**
 * DELETE /ssh/disconnect/:sessionId
 * Disconnects the SSH session.
 */
router.delete("/ssh/disconnect/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  if (session.stream) {
    session.stream.end();
  }
  session.client.end();

  if (session.sseRes && !session.sseRes.writableEnded) {
    session.sseRes.end();
  }

  sessions.delete(sessionId);
  consola.info(`SSH session ${sessionId} disconnected`);

  res.json({ ok: true });
});

export default router;
