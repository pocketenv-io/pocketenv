import { Hono } from "hono";
import { Context } from "./context.ts";
import { logger } from "hono/logger";
import { consola } from "consola";
import {
  files,
  sandboxes,
  sandboxFiles,
  sandboxSecrets,
  sandboxVariables,
  sandboxVolumes,
  secrets,
  sshKeys,
  tailscaleAuthKeys,
  users,
  variables,
  spriteAuth,
  denoAuth,
  vercelAuth,
} from "./schema/mod.ts";
import {
  adjectives,
  nouns,
  generateUniqueAsync,
} from "unique-username-generator";
import { eq, ExtractTablesWithRelations, or } from "drizzle-orm";
import { getConnection } from "./drizzle.ts";
import {
  SandboxConfig,
  SandboxConfigSchema,
  StartSandboxInput,
  StartSandboxInputSchema,
} from "./types/sandbox.ts";
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
import decrypt from "./lib/decrypt.ts";
import { InsertSpriteAuth } from "./schema/sprite-auth.ts";
import daytonaAuth, { InsertDaytonaAuth } from "./schema/daytona-auth.ts";
import { InsertDenoAuth } from "./schema/deno-auth.ts";

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
      return c.json({ error: "Unauthorized" }, 401);
    }
  } else {
    if (c.req.path === "/") {
      await next();
      return;
    }
    return c.json({ error: "Unauthorized" }, 401);
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
  let spriteName = await generateUniqueAsync(
    { dictionaries: [adjectives, nouns], separator: "-" },
    () => false,
  );
  spriteName = `${spriteName}-${suffix}`;

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

      if (params.spriteToken && user?.id) {
        await tx
          .insert(spriteAuth)
          .values({
            sandboxId: record.id,
            spriteToken: params.spriteToken,
            redactedSpriteToken: params.redactedSpriteToken ?? "",
            userId: user.id,
          } satisfies InsertSpriteAuth)
          .execute();
      }

      if (params.daytonaApiKey && user?.id) {
        await tx
          .insert(daytonaAuth)
          .values({
            sandboxId: record.id,
            apiKey: params.daytonaApiKey,
            redactedApiKey: params.redactedDaytonaApiKey ?? "",
            userId: user.id,
            organizationId: params.daytonaOrganizationId!,
          } satisfies InsertDaytonaAuth)
          .execute();
      }

      if (params.denoDeployToken && user?.id) {
        await tx
          .insert(denoAuth)
          .values({
            sandboxId: record.id,
            deployToken: params.denoDeployToken,
            redactedDenoToken: params.redactedDenoDeployToken ?? "",
            userId: user.id,
          } satisfies InsertDenoAuth)
          .execute();
      }

      if (params.vercelApiToken && user?.id) {
        await tx
          .insert(vercelAuth)
          .values({
            sandboxId: record.id,
            vercelToken: params.vercelApiToken,
            redactedVercelToken: params.redactedVercelApiToken ?? "",
            userId: user.id,
            projectId: params.vercelProjectId!,
            teamId: params.vercelTeamId!,
          })
          .execute();
      }

      const sandbox = await createSandbox(params.provider, {
        id: record.id,
        keepAlive: params.keepAlive,
        sleepAfter: params.sleepAfter,
        snapshotRoot: process.env.DENO_SNAPSHOT_ROOT,
        spriteToken: decrypt(params.spriteToken),
        spriteName,
        daytonaApiKey: decrypt(params.daytonaApiKey),
        organizationId: params.daytonaOrganizationId,
        denoDeployToken: decrypt(params.denoDeployToken),
        vercelApiToken: decrypt(params.vercelApiToken),
        vercelProjectId: params.vercelProjectId,
        vercelTeamId: params.vercelTeamId,
      });
      const sandboxId = await sandbox.id();

      [record] = await tx
        .update(sandboxes)
        .set({
          status: "RUNNING",
          sandboxId: sandboxId,
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

  if (!["daytona", "vercel", "deno", "sprites"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const body = await c.req.json<StartSandboxInput>();
  const { repo } = StartSandboxInputSchema.parse(body);

  const [
    [spriteAuthParams],
    [daytonaAuthParams],
    [denoAuthParams],
    [vercelAuthParams],
  ] = await Promise.all([
    c.var.db
      .select()
      .from(spriteAuth)
      .where(eq(spriteAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(daytonaAuth)
      .where(eq(daytonaAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(denoAuth)
      .where(eq(denoAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(vercelAuth)
      .where(eq(vercelAuth.sandboxId, record.id))
      .execute(),
  ]);

  if (!record.sandboxId) {
    sandbox = await createSandbox(record.provider as Provider, {
      id: record.id,
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      organizationId: daytonaAuthParams?.organizationId,
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
    });
    const sandboxId = await sandbox.id();
    await c.var.db
      .update(sandboxes)
      .set({ sandboxId })
      .where(eq(sandboxes.id, record.id))
      .execute();
    record.sandboxId = sandboxId;
  }

  sandbox = await getSandboxById(
    record.provider as Provider,
    record.sandboxId!,
    {
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
      organizationId: daytonaAuthParams?.organizationId,
      vercelApiToken: decrypt(vercelAuthParams?.vercelToken),
      vercelProjectId: vercelAuthParams?.projectId,
      vercelTeamId: vercelAuthParams?.teamId,
    },
  );

  if (!sandbox) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  await sandbox.start();

  c.var.db
    .update(sandboxes)
    .set({
      sandboxId:
        record.provider === "deno" ? await sandbox.id() : record.sandboxId,
    })
    .where(eq(sandboxes.id, record.id))
    .execute()
    .catch((e) =>
      consola.error(
        `Failed to update SSH info for sandbox ${c.req.param("sandboxId")}: ${e}`,
      ),
    );

  const params = await Promise.all([
    c.var.db
      .select()
      .from(sandboxFiles)
      .leftJoin(files, eq(files.id, sandboxFiles.fileId))
      .where(eq(sandboxFiles.sandboxId, c.req.param("sandboxId")))
      .execute(),
    c.var.db
      .select()
      .from(sshKeys)
      .where(eq(sshKeys.sandboxId, c.req.param("sandboxId")))
      .execute(),
    c.var.db
      .select()
      .from(tailscaleAuthKeys)
      .where(eq(tailscaleAuthKeys.sandboxId, c.req.param("sandboxId")))
      .execute(),
    c.var.db
      .select()
      .from(sandboxVolumes)
      .leftJoin(sandboxes, eq(sandboxes.id, sandboxVolumes.sandboxId))
      .leftJoin(users, eq(users.id, sandboxes.userId))
      .where(eq(sandboxVolumes.sandboxId, c.req.param("sandboxId")))
      .execute(),
  ]);

  await sandbox.setupDefaultSshKeys();

  Promise.all([
    ...params[0]
      .filter((x) => x.files !== null)
      .map((record) =>
        sandbox?.writeFile(
          record.sandbox_files.path,
          decrypt(record.files!.content)!,
        ),
      ),
    ...params[1].map((record) =>
      sandbox?.setupSshKeys(decrypt(record.privateKey)!, record.publicKey),
    ),
    params[2].length > 0 &&
      sandbox?.setupTailscale(decrypt(params[2][0].authKey)!),
    ...params[3].map((volume) =>
      sandbox?.mount(
        volume.sandbox_volumes.path,
        `/${volume.users?.did || ""}${volume.users?.did ? "/" : ""}${volume.sandbox_volumes.id}/`,
      ),
    ),
  ])
    .then(() => consola.success(`Sandbox ${c.req.param("sandboxId")} is ready`))
    .catch((e) =>
      consola.error(
        `Failed to set up sandbox ${c.req.param("sandboxId")}: ${e}`,
      ),
    );

  if (record.repo) {
    sandbox
      .clone(record.repo)
      .then(() =>
        consola.success(`Git Repository successfully cloned: ${record.repo}`),
      )
      .catch((e) => consola.error(`Failed to Clone Repository: ${e}`));
  }

  if (repo) {
    sandbox
      .clone(repo)
      .then(() =>
        consola.success(`Git Repository successfully cloned: ${repo}`),
      )
      .catch((e) => consola.error(`Failed to Clone Repository: ${e}`));
  }

  await c.var.db
    .update(sandboxes)
    .set({
      status: "RUNNING",
      startedAt: new Date(),
      sandboxId:
        record.provider === "deno" ? await sandbox.id() : record.sandboxId,
    })
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

  if (!["daytona", "vercel", "deno", "sprites"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const [
    [spriteAuthParams],
    [daytonaAuthParams],
    [denoAuthParams],
    [vercelAuthParams],
  ] = await Promise.all([
    c.var.db
      .select()
      .from(spriteAuth)
      .where(eq(spriteAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(daytonaAuth)
      .where(eq(daytonaAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(denoAuth)
      .where(eq(denoAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(vercelAuth)
      .where(eq(vercelAuth.sandboxId, record.id))
      .execute(),
  ]);

  if (!record.sandboxId) {
    sandbox = await createSandbox(record.provider as Provider, {
      id: record.id,
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      organizationId: daytonaAuthParams?.organizationId,
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
      vercelApiToken: decrypt(vercelAuthParams?.vercelToken),
      vercelProjectId: vercelAuthParams?.projectId,
      vercelTeamId: vercelAuthParams?.teamId,
    });
    const sandboxId = await sandbox.id();
    await c.var.db
      .update(sandboxes)
      .set({ sandboxId })
      .where(eq(sandboxes.id, record.id))
      .execute();
    record.sandboxId = sandboxId;
  }

  sandbox = await getSandboxById(
    record.provider as Provider,
    record.sandboxId!,
    {
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
      organizationId: daytonaAuthParams?.organizationId,
      vercelApiToken: decrypt(vercelAuthParams?.vercelToken),
      vercelProjectId: vercelAuthParams?.projectId,
      vercelTeamId: vercelAuthParams?.teamId,
    },
  );

  if (!sandbox) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  await sandbox.stop();
  await c.var.db
    .update(sandboxes)
    .set({
      status: "STOPPED",
      sandboxId: ["deno", "vercel"].includes(record.provider)
        ? null
        : record.sandboxId,
    })
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

  if (!["daytona", "vercel", "deno", "sprites"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const [
    [spriteAuthParams],
    [daytonaAuthParams],
    [denoAuthParams],
    [vercelAuthParams],
  ] = await Promise.all([
    c.var.db
      .select()
      .from(spriteAuth)
      .where(eq(spriteAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(daytonaAuth)
      .where(eq(daytonaAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(denoAuth)
      .where(eq(denoAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(vercelAuth)
      .where(eq(vercelAuth.sandboxId, record.id))
      .execute(),
  ]);

  if (!record.sandboxId) {
    sandbox = await createSandbox(record.provider as Provider, {
      id: record.id,
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      organizationId: daytonaAuthParams?.organizationId,
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
      vercelApiToken: decrypt(vercelAuthParams?.vercelToken),
      vercelProjectId: vercelAuthParams?.projectId,
      vercelTeamId: vercelAuthParams?.teamId,
    });
    const sandboxId = await sandbox.id();
    await c.var.db
      .update(sandboxes)
      .set({ sandboxId })
      .where(eq(sandboxes.id, record.id))
      .execute();
    record.sandboxId = sandboxId;
  }

  sandbox = await getSandboxById(
    record.provider as Provider,
    record.sandboxId!,
    {
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
      organizationId: daytonaAuthParams?.organizationId,
      vercelApiToken: decrypt(vercelAuthParams?.vercelToken),
      vercelProjectId: vercelAuthParams?.projectId,
      vercelTeamId: vercelAuthParams?.teamId,
    },
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

  if (!["daytona", "vercel", "deno", "sprites"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const [
    [spriteAuthParams],
    [daytonaAuthParams],
    [denoAuthParams],
    [vercelAuthParams],
  ] = await Promise.all([
    c.var.db
      .select()
      .from(spriteAuth)
      .where(eq(spriteAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(daytonaAuth)
      .where(eq(daytonaAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(denoAuth)
      .where(eq(denoAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(vercelAuth)
      .where(eq(vercelAuth.sandboxId, record.id))
      .execute(),
  ]);

  if (!record.sandboxId) {
    sandbox = await createSandbox(record.provider as Provider, {
      id: record.id,
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      organizationId: daytonaAuthParams?.organizationId,
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
      vercelApiToken: decrypt(vercelAuthParams?.vercelToken),
      vercelProjectId: vercelAuthParams?.projectId,
      vercelTeamId: vercelAuthParams?.teamId,
    });
    const sandboxId = await sandbox.id();
    await c.var.db
      .update(sandboxes)
      .set({ sandboxId })
      .where(eq(sandboxes.id, record.id))
      .execute();
    record.sandboxId = sandboxId;
  }

  sandbox = await getSandboxById(
    record.provider as Provider,
    record.sandboxId!,
    {
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
      organizationId: daytonaAuthParams?.organizationId,
      vercelApiToken: decrypt(vercelAuthParams?.vercelToken),
      vercelProjectId: vercelAuthParams?.projectId,
      vercelTeamId: vercelAuthParams?.teamId,
    },
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

app.get("/v1/sandboxes/:sandboxId/ssh", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  let sandbox: BaseSandbox | null = null;

  if (!["daytona", "deno"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const [
    [spriteAuthParams],
    [daytonaAuthParams],
    [denoAuthParams],
    [vercelAuthParams],
  ] = await Promise.all([
    c.var.db
      .select()
      .from(spriteAuth)
      .where(eq(spriteAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(daytonaAuth)
      .where(eq(daytonaAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(denoAuth)
      .where(eq(denoAuth.sandboxId, record.id))
      .execute(),
    c.var.db
      .select()
      .from(vercelAuth)
      .where(eq(vercelAuth.sandboxId, record.id))
      .execute(),
  ]);

  if (!record.sandboxId) {
    sandbox = await createSandbox(record.provider as Provider, {
      id: record.id,
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      organizationId: daytonaAuthParams?.organizationId,
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
      vercelApiToken: decrypt(vercelAuthParams?.vercelToken),
      vercelProjectId: vercelAuthParams?.projectId,
      vercelTeamId: vercelAuthParams?.teamId,
    });
    const sandboxId = await sandbox.id();
    await c.var.db
      .update(sandboxes)
      .set({ sandboxId })
      .where(eq(sandboxes.id, record.id))
      .execute();
    record.sandboxId = sandboxId;
  }

  sandbox = await getSandboxById(
    record.provider as Provider,
    record.sandboxId!,
    {
      daytonaApiKey: decrypt(daytonaAuthParams?.apiKey),
      spriteToken: decrypt(spriteAuthParams?.spriteToken),
      denoDeployToken: decrypt(denoAuthParams?.deployToken),
      organizationId: daytonaAuthParams?.organizationId,
      vercelApiToken: decrypt(vercelAuthParams?.vercelToken),
      vercelProjectId: vercelAuthParams?.projectId,
      vercelTeamId: vercelAuthParams?.teamId,
    },
  );

  if (!sandbox) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  c.var.db
    .update(sandboxes)
    .set({
      sandboxId:
        record.provider === "deno" ? await sandbox.id() : record.sandboxId,
    })
    .where(eq(sandboxes.id, record.id))
    .execute()
    .catch((e) =>
      consola.error(
        `Failed to update SSH info for sandbox ${c.req.param("sandboxId")}: ${e}`,
      ),
    );

  return c.json(await sandbox.ssh());
});

app.post("/v1/sandboxes/:sandboxId/ports", async (c) => {
  // TODO: Implement expose port
  return c.json({});
});

app.delete("/v1/sandboxes/:sandboxId/ports", async (c) => {
  // TODO: Implement unexpose port
  return c.json({});
});

export const getSandbox = async (db: Context["db"], sandboxId: string) => {
  const [record] = await db
    .select()
    .from(sandboxes)
    .where(or(eq(sandboxes.id, sandboxId), eq(sandboxes.sandboxId, sandboxId)))
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
        name: variable.name,
      })),
    )
    .execute();
};

const PORT = 8788;

const url = chalk.greenBright(`http://localhost:${PORT}`);
consola.info(`Starting server on ${url}`);

Deno.serve({ port: PORT }, app.fetch);
