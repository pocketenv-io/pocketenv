import { Hono } from "hono";
import { cors } from "hono/cors";
import { Context } from "./context";
import { getSandbox, Sandbox } from "@cloudflare/sandbox";
import {
  sandboxes,
  sandboxSecrets,
  sandboxVariables,
  secrets,
  users,
  variables,
} from "./schema";
import {
  adjectives,
  nouns,
  generateUniqueAsync,
} from "unique-username-generator";
import { eq, ExtractTablesWithRelations, or } from "drizzle-orm";
import { getConnection } from "./drizzle";
import { env } from "cloudflare:workers";
import { SandboxConfig, SandboxConfigSchema } from "./types/sandbox";
import { BaseSandbox, createSandbox } from "./providers";
import { SelectSandbox } from "./schema/sandboxes";
import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { consola } from "consola";

type Bindings = {
  Sandbox: DurableObjectNamespace<Sandbox<Env>>;
};

const app = new Hono<{ Variables: Context; Bindings: Bindings }>();

app.use(cors());

app.use("*", async (c, next) => {
  c.set("db", getConnection());
  const token = c.req.header("Authorization")?.split(" ")[1]?.trim();
  if (token) {
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET!);
      c.set("did", decoded?.payload?.sub);
    } catch (err) {
      consola.error("JWT verification failed:", err);
      return c.json({ error: "Unauthorized" }, 401);
    }
  } else {
    if (!c.req.path.endsWith("/ws/terminal") && c.req.path !== "/") {
      consola.warn("No Authorization header found");
      return c.json({ error: "Unauthorized" }, 401);
    }
  }
  await next();
});

interface CmdOutput {
  success: boolean;
  stdout: string;
  stderr: string;
}
const getOutput = (res: CmdOutput) => (res.success ? res.stdout : res.stderr);

app.get("/", async (c) => {
  return c.text(`
    _____                 ____
   / ___/____ _____  ____/ / /_  ____  _  __
   \\__ \\/ __ \`/ __ \\/ __  / __ \\/ __ \\| |/_/
  ___/ / /_/ / / / / /_/ / /_/ / /_/ />  <
 /____/\\__,_/_/ /_/\\__,_/_.___/\\____/_/|_|

    `);
});

app.post("/v1/sandboxes", async (c) => {
  const body = await c.req.json<SandboxConfig>();

  let suffix = Math.random().toString(36).substring(2, 6);
  let name = await generateUniqueAsync(
    { dictionaries: [adjectives, nouns], separator: "-" },
    () => false,
  );

  try {
    const params = SandboxConfigSchema.parse(body);
    name = params.name || `${name}-${suffix}`;
    do {
      const existing = await c.var.db
        .select()
        .from(sandboxes)
        .where(eq(sandboxes.name, name))
        .execute();
      if (existing.length === 0) {
        break;
      }

      name = await generateUniqueAsync(
        { dictionaries: [adjectives, nouns], separator: "-" },
        () => false,
      );
      suffix = Math.random().toString(36).substring(2, 6);
      name = `${name}-${suffix}`;
    } while (true);

    const record = await c.var.db.transaction(async (tx) => {
      const user = await tx
        .select()
        .from(users)
        .where(eq(users.did, c.var.did || ""))
        .execute()
        .then(([row]) => row);

      let [record] = await tx
        .insert(sandboxes)
        .values({
          base: params.base,
          name,
          provider: params.provider,
          publicKey: env.PUBLIC_KEY,
          userId: user?.id,
          instanceType: "standard-1",
          keepAlive: params.keepAlive,
          sleepAfter: params.sleepAfter,
          vcpus: params.vcpus,
          memory: params.memory,
          disk: params.disk,
          status: "INITIALIZING",
        })
        .returning()
        .execute();

      if (params.secrets.length > 0) {
        await saveSecrets(tx, record, { secrets: params.secrets });
      }

      if (params.variables.length > 0) {
        await saveVariables(tx, record, { variables: params.variables });
      }

      const sandbox = await createSandbox(params.provider, {
        id: record.id,
        keepAlive: params.keepAlive,
        sleepAfter: params.sleepAfter,
      });
      const sandboxId = await sandbox.id();

      [record] = await tx
        .update(sandboxes)
        .set({ status: "RUNNING", sandbox_id: sandboxId })
        .where(eq(sandboxes.id, record.id))
        .returning()
        .execute();

      return record;
    });

    return c.json(record);
  } catch (err) {
    console.log(err);
    return c.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      400,
    );
  }
});

app.get("/v1/sandboxes/:sandboxId", async (c) => {
  const { sandboxes: record } = await getSandboxById(
    c.var.db,
    c.req.param("sandboxId"),
  );
  return c.json(record);
});

app.put("/v1/sandboxes/:sandboxId", async (c) => {
  return c.json({});
});

app.get("/v1/sandboxes", async (c) => {
  const records = await c.var.db.select().from(sandboxes).execute();
  return c.json(records);
});

app.post("/v1/sandboxes/:sandboxId/start", async (c) => {
  const { sandboxes: record } = await getSandboxById(
    c.var.db,
    c.req.param("sandboxId"),
  );

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  let sandbox: BaseSandbox | null = null;

  if (record.provider !== "cloudflare") {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  try {
    sandbox = await createSandbox("cloudflare", {
      id: c.req.param("sandboxId"),
      memory: "4GiB",
    });

    if (!sandbox) {
      return c.json({ error: "Sandbox provider not supported" }, 400);
    }

    await sandbox.start();
    await c.var.db
      .update(sandboxes)
      .set({ status: "RUNNING" })
      .where(eq(sandboxes.id, c.req.param("sandboxId")))
      .execute();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    consola.error("Failed to start sandbox:", errorMessage);
    return c.json({ error: `Failed to start sandbox: ${errorMessage}` }, 500);
  }
  return c.json({});
});

app.post("/v1/sandboxes/:sandboxId/stop", async (c) => {
  const { sandboxes: record } = await getSandboxById(
    c.var.db,
    c.req.param("sandboxId"),
  );

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  if (record.provider !== "cloudflare") {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  try {
    let sandbox: BaseSandbox | null = null;

    sandbox = await createSandbox("cloudflare", {
      id: c.req.param("sandboxId"),
    });

    if (!sandbox) {
      return c.json({ error: "Sandbox provider not supported" }, 400);
    }

    await sandbox.stop();
    await c.var.db
      .update(sandboxes)
      .set({ status: "STOPPED" })
      .where(eq(sandboxes.id, c.req.param("sandboxId")))
      .execute();
    return c.json({});
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    consola.error("Failed to stop sandbox:", errorMessage);
    return c.json({ error: `Failed to stop sandbox: ${errorMessage}` }, 500);
  }
});

app.post("/v1/sandboxes/:sandboxId/runs", async (c) => {
  const { sandboxes: record } = await getSandboxById(
    c.var.db,
    c.req.param("sandboxId"),
  );

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  if (record.provider !== "cloudflare") {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  try {
    let sandbox: BaseSandbox | null = null;

    sandbox = await createSandbox("cloudflare", {
      id: c.req.param("sandboxId"),
    });

    const { command } = await c.req.json();
    const res = await sandbox.sh`${command}`;
    return c.json(res);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    consola.error("Failed to run command in sandbox:", errorMessage);
    return c.json({ error: `Failed to run command: ${errorMessage}` }, 500);
  }
});

app.delete("/v1/sandboxes/:sandboxId", async (c) => {
  const { sandboxes: record } = await getSandboxById(
    c.var.db,
    c.req.param("sandboxId"),
  );

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  if (record.provider !== "cloudflare") {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  try {
    let sandbox: BaseSandbox | null = null;

    sandbox = await createSandbox("cloudflare", {
      id: c.req.param("sandboxId"),
    });

    await sandbox.delete();

    await c.var.db
      .delete(sandboxes)
      .where(eq(sandboxes.id, c.req.param("sandboxId")))
      .execute();

    return c.json({ success: true }, 200);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    consola.error("Failed to delete sandbox:", errorMessage);
    return c.json({ error: `Failed to delete sandbox: ${errorMessage}` }, 500);
  }
});

app.get("/v1/sandboxes/:sandboxId/ws/terminal", async (c) => {
  if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
    return c.text("Expected WebSocket connection", 426);
  }
  const token = c.req.query("t");
  if (token) {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET!);

    const { sandboxes: record, users: user } = await getSandboxById(
      c.var.db,
      c.req.param("sandboxId"),
    );
    if (!record) {
      return c.text("Sandbox not found", 404);
    }

    if (record.userId && user && user?.did !== decoded?.payload?.sub) {
      return c.text("Unauthorized", 403);
    }
  }

  const sandbox = getSandbox(c.env.Sandbox, c.req.param("sandboxId"));
  const sessionId = c.req.query("session");
  try {
    if (sessionId) {
      const session = await sandbox.getSession(sessionId);
      return session.terminal(c.req.raw);
    }

    return sandbox.terminal(c.req.raw);
  } catch (err) {
    console.error(err);
    return c.text("Failed to connect to sandbox", 500);
  }
});

export const getSandboxById = async (db: Context["db"], sandboxId: string) => {
  const [record] = await db
    .select()
    .from(sandboxes)
    .leftJoin(users, eq(sandboxes.userId, users.id))
    .where(or(eq(sandboxes.id, sandboxId), eq(sandboxes.sandbox_id, sandboxId)))
    .execute();

  return record;
};

export const saveSecrets = async (
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  sandbox: SelectSandbox,
  values: { secrets: { name: string; value: string }[] },
) => {
  const insertedSecrets = await tx
    .insert(secrets)
    .values(values.secrets)
    .returning()
    .execute();

  await tx
    .insert(sandboxSecrets)
    .values(
      insertedSecrets.map((secret) => ({
        sandboxId: sandbox.id,
        secretId: secret.id,
      })),
    )
    .execute();
};

export const saveVariables = async (
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  sandbox: SelectSandbox,
  values: { variables: { name: string; value: string }[] },
) => {
  const insertedVariables = await tx
    .insert(variables)
    .values(values.variables)
    .returning()
    .execute();

  await tx
    .insert(sandboxVariables)
    .values(
      insertedVariables.map((variable) => ({
        sandboxId: sandbox.id,
        variableId: variable.id,
      })),
    )
    .execute();
};

export { Sandbox } from "@cloudflare/sandbox";

export default app;
