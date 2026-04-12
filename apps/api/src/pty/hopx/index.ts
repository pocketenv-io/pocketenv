import type { Context, Session, TerminalSocket } from "context";
import { eq, or } from "drizzle-orm";
import schema from "schema";
import { consola } from "consola";
import { Sandbox } from "@hopx-ai/sdk";
import decrypt from "lib/decrypt";
import chalk from "chalk";
import type { Message } from "pty/pty-tunnel/messages";

export async function createTerminalSession(
  ctx: Context,
  id: string,
  key = id,
): Promise<Session> {
  const [record] = await ctx.db
    .select()
    .from(schema.sandboxes)
    .leftJoin(
      schema.hopxAuth,
      eq(schema.hopxAuth.sandboxId, schema.sandboxes.id),
    )
    .where(or(eq(schema.sandboxes.id, id), eq(schema.sandboxes.sandboxId, id)))
    .execute();

  if (!record?.hopx_auth) {
    consola.error("Hopx auth not found for sandbox", { id });
    throw new Error("Hopx auth not found for sandbox " + id);
  }

  if (!record.sandboxes.sandboxId) {
    consola.error("Sandbox ID not found for sandbox", { id });
    throw new Error("Sandbox ID not found for sandbox " + id);
  }

  const sandboxId = record.sandboxes.sandboxId;
  const apiKey = decrypt(record.hopx_auth.apiKey);

  consola.info("Hopx: connecting to sandbox", chalk.greenBright(sandboxId));
  const sandbox = await Sandbox.connect(sandboxId, apiKey);
  consola.info("Hopx: sandbox connected", chalk.greenBright(sandboxId));

  consola.info("Hopx: connecting terminal", chalk.greenBright(sandboxId));
  const ws = await sandbox.terminal.connect();
  consola.info("Hopx: terminal connected", chalk.greenBright(sandboxId));

  sandbox.terminal.resize(
    ws,
    process.stdout.columns ?? 80,
    process.stdout.rows ?? 24,
  );

  const socket: TerminalSocket = {
    sendMessage(msg: Message) {
      if (msg.type === "message") {
        sandbox.terminal.sendInput(ws, msg.message);
      } else if (msg.type === "resize") {
        sandbox.terminal.resize(ws, msg.cols, msg.rows);
      }
    },
  };

  const session: Session = { socket, clients: new Set(), wsClients: new Set() };

  (async () => {
    try {
      for await (const message of sandbox.terminal.output(ws)) {
        if (message.type === "output") {
          const text = message.data;
          for (const res of session.clients) {
            res.write("event: output\n");
            res.write(`data: ${JSON.stringify({ data: text })}\n\n`);
          }
          for (const client of session.wsClients) {
            if (client.readyState === client.OPEN) client.send(text);
          }
        } else if (message.type === "exit") {
          break;
        }
      }
    } catch (err) {
      consola.error("Hopx terminal output error:", err);
    } finally {
      ctx.sessions.delete(key);
      for (const client of session.wsClients) {
        if (client.readyState === client.OPEN) client.close(1000, "exit");
      }
      session.clients.clear();
      session.wsClients.clear();
    }
  })();

  consola.info("Hopx: terminal session ready", chalk.greenBright(id));
  ctx.sessions.set(key, session);
  return session;
}
