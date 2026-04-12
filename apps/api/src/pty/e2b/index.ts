import type { Context, Session, TerminalSocket } from "context";
import { eq, or } from "drizzle-orm";
import schema from "schema";
import { consola } from "consola";
import { Sandbox } from "e2b";
import decrypt from "lib/decrypt";
import type { Message } from "pty/pty-tunnel/messages";

export async function createTerminalSession(ctx: Context, id: string, key = id): Promise<Session> {
  const [record] = await ctx.db
    .select()
    .from(schema.sandboxes)
    .leftJoin(schema.e2bAuth, eq(schema.e2bAuth.sandboxId, schema.sandboxes.id))
    .where(or(eq(schema.sandboxes.id, id), eq(schema.sandboxes.sandboxId, id)))
    .execute();

  if (!record?.e2b_auth) {
    consola.error("E2B auth not found for sandbox", { id });
    throw new Error("E2B auth not found for sandbox " + id);
  }

  if (!record.sandboxes.sandboxId) {
    consola.error("Sandbox ID not found for sandbox", { id });
    throw new Error("Sandbox ID not found for sandbox " + id);
  }

  const sandbox = await Sandbox.connect(record.sandboxes.sandboxId, {
    apiKey: decrypt(record.e2b_auth.apiKey),
  });

  // pid is set after pty.create() resolves; sendMessage closes over it.
  let pid = 0;

  const socket: TerminalSocket = {
    sendMessage(msg: Message) {
      if (msg.type === "message") {
        sandbox.pty
          .sendInput(pid, new TextEncoder().encode(msg.message))
          .catch((err) => consola.error("E2B PTY sendInput error:", err));
      } else if (msg.type === "resize") {
        sandbox.pty
          .resize(pid, { cols: msg.cols, rows: msg.rows })
          .catch((err) => consola.error("E2B PTY resize error:", err));
      }
    },
  };

  const session: Session = { socket, clients: new Set(), wsClients: new Set() };

  const terminal = await sandbox.pty.create({
    cols: process.stdout.columns ?? 80,
    rows: process.stdout.rows ?? 24,
    onData: (data) => {
      const text = Buffer.from(data).toString("utf-8");
      for (const res of session.clients) {
        res.write("event: output\n");
        res.write(`data: ${JSON.stringify({ data: text })}\n\n`);
      }
      for (const ws of session.wsClients) {
        if (ws.readyState === ws.OPEN) ws.send(text);
      }
    },
  });

  pid = terminal.pid;
  consola.info("E2B PTY session created", { id, pid });

  ctx.sessions.set(key, session);
  return session;
}
