import { Hono } from "hono";
import { Context } from "../context";
import { getSandbox, Sandbox } from "@cloudflare/sandbox";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { getSandboxRecord } from "../lib/sandbox-helpers";

type Bindings = { Sandbox: DurableObjectNamespace<Sandbox<Env>> };
type App = { Variables: Context; Bindings: Bindings };

export const terminalRoutes = new Hono<App>();

terminalRoutes.get("/v1/sandboxes/:sandboxId/ws/terminal", async (c) => {
  if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
    return c.text("Expected WebSocket connection", 426);
  }

  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;
  const user = result?.user;

  if (!record) return c.text("Sandbox not found", 404);

  const token = c.req.query("t");
  if (token) {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET!);
    if (record.userId && user && user.did !== decoded?.payload?.sub) {
      return c.text("Unauthorized", 403);
    }
  }

  if (!record.sandboxId) return c.text("Sandbox not started", 400);

  const sandbox = getSandbox(c.env.Sandbox, record.sandboxId);
  await sandbox.start();

  const sessionId = c.req.query("session");

  try {
    if (sessionId) {
      const session = await sandbox.getSession(sessionId);
      return session.terminal(c.req.raw);
    }
    return sandbox.terminal(c.req.raw);
  } catch (err) {
    console.log(err);
    return c.text("Failed to connect to sandbox", 500);
  }
});
