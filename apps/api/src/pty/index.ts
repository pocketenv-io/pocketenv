import { consola } from "consola";
import type { Context } from "context";
import * as context from "context";
import express, { Router } from "express";
import { env } from "lib/env";
import jwt from "jsonwebtoken";
import { eq, or } from "drizzle-orm";
import schema from "schema";
import * as vercel from "./vercel";
import * as modal from "./modal";
import * as e2b from "./e2b";
import { WebSocketServer, type WebSocket } from "ws";
import type { IncomingMessage } from "http";

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

async function getSession(ctx: Context, id: string) {
  if (ctx.sessions.has(id)) {
    const existing = ctx.sessions.get(id)!;
    // If the underlying pty-tunnel socket is closed, evict and recreate.
    const sock = existing.socket as { readyState?: number };
    if (sock.readyState !== undefined && sock.readyState !== 1 /* OPEN */) {
      consola.info("PTY session stale, recreating", { id });
      ctx.sessions.delete(id);
    } else {
      return existing;
    }
  }

  const [record] = await ctx.db
    .select({
      modalAuth: schema.modalAuth.id,
      e2bAuth: schema.e2bAuth.id,
    })
    .from(schema.sandboxes)
    .leftJoin(
      schema.modalAuth,
      eq(schema.modalAuth.sandboxId, schema.sandboxes.id),
    )
    .leftJoin(schema.e2bAuth, eq(schema.e2bAuth.sandboxId, schema.sandboxes.id))
    .where(or(eq(schema.sandboxes.id, id), eq(schema.sandboxes.sandboxId, id)))
    .execute();

  if (record?.modalAuth) return modal.createTerminalSession(ctx, id);
  if (record?.e2bAuth) return e2b.createTerminalSession(ctx, id);
  return vercel.createTerminalSession(ctx, id);
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

export function attachWebSocket(base: string) {
  const pathRegex = new RegExp(`^${base}/([^/]+)/ws$`);
  const wss = new WebSocketServer({ noServer: true });

  wss.on(
    "connection",
    async (ws: WebSocket, req: IncomingMessage, id: string) => {
      const url = new URL(req.url ?? "", "http://localhost");

      // Auth: query param ?token=<jwt> or Authorization: Bearer <jwt> header
      const tokenParam = url.searchParams.get("token");
      const authHeader = req.headers.authorization;
      const bearer = tokenParam ?? authHeader?.split("Bearer ")[1]?.trim();
      if (bearer && bearer !== "null") {
        try {
          jwt.verify(bearer, env.JWT_SECRET, { ignoreExpiration: true });
        } catch (err) {
          consola.error("WS: Invalid JWT token:", err);
          ws.close(1008, "Invalid token");
          return;
        }
      }

      // The WS upgrade completes immediately but session creation is async.
      // Buffer any messages (resize, keystrokes) that arrive before the session
      // is ready so they can be replayed once the session exists.
      const pendingMessages: Buffer[] = [];
      const bufferMessage = (data: Buffer) => pendingMessages.push(data);
      ws.on("message", bufferMessage);

      let session: Awaited<ReturnType<typeof getSession>>;
      try {
        session = await getSession(context.ctx, id);
      } catch (err) {
        consola.error("WS: Failed to get session:", err);
        ws.close(1011, "Session error");
        return;
      }

      session.wsClients.add(ws);
      ws.off("message", bufferMessage);

      const handleMessage = (data: Buffer) => {
        const text = data.toString("utf-8");
        try {
          const msg = JSON.parse(text);
          if (
            msg?.type === "resize" &&
            Number.isInteger(msg.cols) &&
            Number.isInteger(msg.rows)
          ) {
            session.socket.sendMessage({
              type: "resize",
              cols: msg.cols,
              rows: msg.rows,
            });
            return;
          }
        } catch {
          // not JSON — treat as raw input
        }
        session.socket.sendMessage({ type: "message", message: text });
      };

      // Replay messages buffered during session setup (e.g. the initial resize).
      for (const data of pendingMessages) {
        handleMessage(data);
      }

      ws.on("message", (data) => handleMessage(data as Buffer));

      ws.on("close", () => {
        session.wsClients.delete(ws);
      });

      // The shell's initial prompt was output while wsClients was empty and is
      // now lost. Send a newline to trigger a fresh prompt redraw.
      session.socket.sendMessage({ type: "message", message: "\n" });
    },
  );

  return { wss, pathRegex };
}
