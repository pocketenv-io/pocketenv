import { Hono } from "hono";
import { Context } from "./context.ts";
import { logger } from "hono/logger";
import { consola } from "consola";
import {
  sandboxes,
  sandboxSecrets,
  sandboxVariables,
  secrets,
  users,
  variables,
} from "./schema/mod.ts";
import {
  adjectives,
  nouns,
  generateUniqueAsync,
} from "unique-username-generator";
import { eq, ExtractTablesWithRelations, or } from "drizzle-orm";
import { getConnection } from "./drizzle.ts";
import { SandboxConfig, SandboxConfigSchema } from "./types/sandbox.ts";
import {
  BaseSandbox,
  createSandbox,
  getSandboxById,
  Provider,
} from "./providers/mod.ts";
import { SelectSandbox } from "./schema/sandboxes.ts";
import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import chalk from "chalk";
import process from "node:process";
import jwt from "@tsndr/cloudflare-worker-jwt";

const app = new Hono<{ Variables: Context }>();

app.use("*", async (c, next) => {
  c.set("db", getConnection());
  const token = c.req.header("Authorization")?.split(" ")[1]?.trim();
  if (token) {
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET!);
      c.set("did", decoded?.payload.sub);
    } catch (err) {
      consola.error("JWT verification failed:", err);
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

app.use(logger());

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
        .then((res) => res[0]);
      let [record] = await tx
        .insert(sandboxes)
        .values({
          base: params.base,
          name,
          provider: params.provider,
          publicKey: process.env.PUBLIC_KEY!,
          userId: user?.id,
          instanceType: "standard-1",
          keepAlive: params.keepAlive,
          sleepAfter: params.sleepAfter,
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
        organizationId: process.env.DAYTONA_ORGANIZATION_ID,
      });
      const sandboxId = await sandbox.id();

      [record] = await tx
        .update(sandboxes)
        .set({
          status: "RUNNING",
          sandbox_id: sandboxId,
          startedAt: new Date(),
          vcpus: params.vcpus,
          memory: params.memory,
          disk: params.disk,
        })
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
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));
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
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  let sandbox: BaseSandbox | null = null;

  if (!["daytona", "vercel", "deno"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  sandbox = await getSandboxById(
    record.provider as Provider,
    record.sandbox_id!,
  );

  if (!sandbox) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  await sandbox.start();
  await c.var.db
    .update(sandboxes)
    .set({ status: "RUNNING", startedAt: new Date() })
    .where(eq(sandboxes.id, c.req.param("sandboxId")))
    .execute();
  return c.json({});
});

app.post("/v1/sandboxes/:sandboxId/stop", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  let sandbox: BaseSandbox | null = null;

  if (!["daytona", "vercel", "deno"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  sandbox = await getSandboxById(
    record.provider as Provider,
    record.sandbox_id!,
  );

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
});

app.post("/v1/sandboxes/:sandboxId/runs", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  let sandbox: BaseSandbox | null = null;

  if (!["daytona", "vercel", "deno"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  sandbox = await getSandboxById(
    record.provider as Provider,
    record.sandbox_id!,
  );

  if (!sandbox) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const { command } = await c.req.json();
  const res = await sandbox.sh`${command}`;
  return c.json(res);
});

app.delete("/v1/sandboxes/:sandboxId", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  let sandbox: BaseSandbox | null = null;

  if (!["daytona", "vercel", "deno"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  sandbox = await getSandboxById(
    record.provider as Provider,
    record.sandbox_id!,
  );

  if (!sandbox) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  await sandbox.delete();

  await c.var.db
    .delete(sandboxes)
    .where(eq(sandboxes.id, c.req.param("sandboxId")))
    .execute();

  return c.json({ success: true }, 200);
});

export const getSandbox = async (db: Context["db"], sandboxId: string) => {
  const [record] = await db
    .select()
    .from(sandboxes)
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

const PORT = 8788;

const url = chalk.greenBright(`http://localhost:${PORT}`);
consola.info(`Starting server on ${url}`);

Deno.serve({ port: PORT }, app.fetch);
