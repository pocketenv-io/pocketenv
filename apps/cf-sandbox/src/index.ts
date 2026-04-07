import { Hono } from "hono";
import { cors } from "hono/cors";
import { Context } from "./context";
import { proxyToSandbox, Sandbox } from "@cloudflare/sandbox";
import { authMiddleware } from "./middleware/auth";
import { cpRoutes } from "./routes/cp";
import { sandboxRoutes } from "./routes/sandboxes";
import { terminalRoutes } from "./routes/terminal";
import { backups } from "./schema";
import dayjs from "dayjs";
import { createSandbox } from "./providers";
import { getConnection } from "./drizzle";

export { saveSecrets, saveVariables, getSandboxRecord as getSandboxById } from "./lib/sandbox-helpers";

type Bindings = {
  Sandbox: DurableObjectNamespace<Sandbox<Env>>;
  backup_queue: Queue;
};

const app = new Hono<{ Variables: Context; Bindings: Bindings }>();

app.use(cors());

app.use("*", async (c, next) => {
  const proxyResponse = await proxyToSandbox(c.req.raw, c.env);
  if (proxyResponse) return proxyResponse;
  await next();
});

app.use("*", authMiddleware);

app.get("/", (c) =>
  c.text(`
    _____                 ____
   / ___/____ _____  ____/ / /_  ____  _  __
   \\__ \\/ __ \`/ __ \\/ __  / __ \\/ __ \\| |/_/
  ___/ / /_/ / / / / /_/ / /_/ / /_/ />  <
 /____/\\__,_/_/ /_/\\__,_/_.___/\\____/_/|_|

    `),
);

app.route("/", cpRoutes);
app.route("/", sandboxRoutes);
app.route("/", terminalRoutes);

export { Sandbox } from "@cloudflare/sandbox";

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<{
    directory: string;
    description?: string;
    ttl?: number;
    sandboxId: string;
    recordId: string;
  }>, env: Env) {
    const db = getConnection();
    for (const message of batch.messages) {
      const params = message.body;
      const sandbox = await createSandbox('cloudflare', { id: params.sandboxId });
      const backupId = await sandbox.backup(params.directory, params.ttl);

      await db.insert(backups).values({
        backupId,
        sandboxId: params.recordId,
        directory: params.directory,
        description: params.description,
        expiresAt: params.ttl ? dayjs().add(params.ttl, "second").toDate() : dayjs().add(3, "days").toDate(),
     })
       .execute();
      }
    },
};
