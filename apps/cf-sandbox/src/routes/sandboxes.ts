import { Hono } from "hono";
import { Context } from "../context";
import { Sandbox } from "@cloudflare/sandbox";
import { eq, and, isNull, or } from "drizzle-orm";
import { adjectives, nouns, generateUniqueAsync } from "unique-username-generator";
import { env } from "cloudflare:workers";
import { consola } from "consola";
import {
  SandboxConfig,
  SandboxConfigSchema,
  StartSandboxConfig,
  StartSandboxConfigSchema,
} from "../types/sandbox";
import { createSandbox } from "../providers";
import { SelectSandbox } from "../schema/sandboxes";
import { sandboxes, users, services, backups } from "../schema";
import {
  getSandboxRecord,
  generateSandboxId,
  saveSecrets,
  saveVariables,
  scheduleRepoClone,
  ensureSandboxId,
  toErrorMessage,
} from "../lib/sandbox-helpers";
import {
  fetchSandboxResources,
  buildSandboxEnvs,
  scheduleInfraSetup,
  exposePortsAndUpdate,
  startAndTrackServices,
} from "../lib/sandbox-resources";
import { PushDirectoryParams, pushSchema } from "../types/push";
import { PullDirectoryParams, pullSchema } from "../types/pull";
import { BackupParams } from "../types/backup";
import dayjs from "dayjs";
import { RestoreParams } from "../types/restore";

type Bindings = { Sandbox: DurableObjectNamespace<Sandbox<Env>> };
type App = { Variables: Context; Bindings: Bindings };

export const sandboxRoutes = new Hono<App>();

sandboxRoutes.post("/v1/sandboxes", async (c) => {
  const body = await c.req.json<SandboxConfig>();

  let suffix = Math.random().toString(36).substring(2, 6);
  let name = await generateUniqueAsync(
    { dictionaries: [adjectives, nouns], separator: "-" },
    () => false,
  );

  try {
    const params = SandboxConfigSchema.parse(body);
    name = params.name || `${name}-${suffix}`;
    let existing: SelectSandbox[] = [];

    if (params.name) {
      existing = await c.var.db
        .select()
        .from(sandboxes)
        .where(and(eq(sandboxes.name, params.name), isNull(sandboxes.userId)))
        .execute();
    }

    const canBeClaimed = existing.length !== 0;

    if (!canBeClaimed) {
      do {
        existing = await c.var.db
          .select()
          .from(sandboxes)
          .where(eq(sandboxes.name, name))
          .execute();
        if (existing.length === 0) break;

        name = await generateUniqueAsync(
          { dictionaries: [adjectives, nouns], separator: "-" },
          () => false,
        );
        suffix = Math.random().toString(36).substring(2, 6);
        name = `${name}-${suffix}`;
      } while (true);
    }

    const record = await c.var.db.transaction(async (tx) => {
      const user = await tx
        .select()
        .from(users)
        .where(eq(users.did, c.var.did || ""))
        .execute()
        .then(([row]) => row);

      let record: SelectSandbox | undefined;

      if (canBeClaimed) {
        record = await tx
          .update(sandboxes)
          .set({ userId: user?.id })
          .where(eq(sandboxes.id, existing[0].id))
          .returning()
          .execute()
          .then(([row]) => row);
      } else {
        record = await tx
          .insert(sandboxes)
          .values({
            base: params.base,
            name,
            repo: params.repo,
            provider: params.provider,
            publicKey: env.PUBLIC_KEY,
            userId: user?.id,
            instanceType: "standard-3",
            keepAlive: params.keepAlive,
            sleepAfter: params.sleepAfter,
            vcpus: params.vcpus,
            memory: params.memory,
            disk: params.disk,
            status: "INITIALIZING",
          })
          .returning()
          .execute()
          .then(([row]) => row);
      }

      if (params.secrets.length > 0) await saveSecrets(tx, record!, { secrets: params.secrets });
      if (params.variables.length > 0) await saveVariables(tx, record!, { variables: params.variables });

      const sandboxId = generateSandboxId();
      const sandboxInstance = await createSandbox(params.provider, {
        id: sandboxId,
        keepAlive: params.keepAlive,
        sleepAfter: params.sleepAfter,
      });

      await sandboxInstance.start();

      [record] = await tx
        .update(sandboxes)
        .set({ status: "RUNNING", sandboxId, startedAt: new Date() })
        .where(eq(sandboxes.id, record!.id))
        .returning()
        .execute();

      if (params.repo) scheduleRepoClone(c.executionCtx, sandboxInstance, params.repo);

      const baseSandbox = await tx
        .select()
        .from(sandboxes)
        .where(eq(sandboxes.name, params.base))
        .execute()
        .then((rows) => rows[0]);

      await tx
        .update(sandboxes)
        .set({ installs: (baseSandbox?.installs || 0) + 1 })
        .where(eq(sandboxes.name, params.base))
        .execute();

      return record;
    });

    return c.json(record);
  } catch (err) {
    console.log(err);
    return c.json(
      { error: toErrorMessage(err) },
      400,
    );
  }
});

sandboxRoutes.get("/v1/sandboxes", async (c) => {
  const records = await c.var.db.select().from(sandboxes).execute();
  return c.json(records);
});

sandboxRoutes.get("/v1/sandboxes/:sandboxId", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  return c.json(result?.sandbox);
});

sandboxRoutes.put("/v1/sandboxes/:sandboxId", async (c) => {
  return c.json({});
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/start", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  const body = await c.req.json<StartSandboxConfig>();
  const { repo, keepAlive } = StartSandboxConfigSchema.parse(body);

  const sandboxId = generateSandboxId();
  await ensureSandboxId(c.var.db, c.req.param("sandboxId"), sandboxId);

  try {
    const sandbox = await createSandbox("cloudflare", {
      id: record.sandboxId || sandboxId,
      memory: "4GiB",
      keepAlive,
    });

    if (!sandbox) return c.json({ error: "Sandbox provider not supported" }, 400);

    if (repo) scheduleRepoClone(c.executionCtx, sandbox, repo);

    await c.var.db
      .update(sandboxes)
      .set({ status: "RUNNING", sandboxId: record.sandboxId || sandboxId, startedAt: new Date() })
      .where(eq(sandboxes.id, c.req.param("sandboxId")))
      .execute();

    const resources = await fetchSandboxResources(c.var.db, c.req.param("sandboxId"));

    c.executionCtx.waitUntil(
      sandbox.setEnvs(await buildSandboxEnvs(resources)),
    );

    c.executionCtx.waitUntil(
      sandbox.sh`[ -f /root/.ssh/id_ed25519 ] || ssh-keygen -t ed25519 -f /root/.ssh/id_ed25519 -q -N "" || true`,
    );

    await scheduleInfraSetup(c.executionCtx, sandbox, resources);

    if (record.repo) scheduleRepoClone(c.executionCtx, sandbox, record.repo);

    const { hostname } = new URL(c.req.url);
    await exposePortsAndUpdate(c.var.db, sandbox, hostname, record, resources.ports);

    await startAndTrackServices(c.executionCtx, c.var.db, sandbox, resources.serviceList);
  } catch (err) {
    const msg = toErrorMessage(err);
    consola.log("Failed to start sandbox:", msg);
    return c.json({ error: `Failed to start sandbox: ${msg}` }, 500);
  }

  return c.json({});
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/stop", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);
  if (!record.sandboxId) return c.json({ error: "Sandbox is not running" }, 400);

  try {
    const sandbox = await createSandbox("cloudflare", { id: record.sandboxId });
    if (!sandbox) return c.json({ error: "Sandbox provider not supported" }, 400);

    const { sandboxVolumes } = await import("../schema");
    const volumes = await c.var.db
      .select()
      .from(sandboxVolumes)
      .where(eq(sandboxVolumes.sandboxId, c.req.param("sandboxId")))
      .execute();

    try {
      await Promise.all(volumes.map((v) => sandbox.unmount(v.path)));
    } catch (e) {
      console.error(e);
    }

    await sandbox.stop();
    await Promise.all([
      c.var.db.update(sandboxes).set({ status: "STOPPED" }).where(eq(sandboxes.id, c.req.param("sandboxId"))).execute(),
      c.var.db.update(services).set({ status: "STOPPED" }).where(eq(services.sandboxId, c.req.param("sandboxId"))).execute(),
    ]);

    return c.json({});
  } catch (err) {
    const msg = toErrorMessage(err);
    consola.error("Failed to stop sandbox:", msg);
    return c.json({ error: `Failed to stop sandbox: ${msg}` }, 500);
  }
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/runs", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);
  if (record.status !== "RUNNING") return c.json({ error: "Sandbox is not running" }, 400);

  try {
    const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });
    const { command } = await c.req.json();
    const res = await sandbox.sh`${command}`;
    return c.json(res);
  } catch (err) {
    const msg = toErrorMessage(err);
    consola.error("Failed to run command in sandbox:", msg);
    return c.json({ error: `Failed to run command: ${msg}` }, 500);
  }
});

sandboxRoutes.delete("/v1/sandboxes/:sandboxId", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  try {
    const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });
    await sandbox.delete();
    await c.var.db
      .delete(sandboxes)
      .where(
        or(
          eq(sandboxes.id, c.req.param("sandboxId")),
          eq(sandboxes.name, c.req.param("sandboxId")),
        ),
      )
      .execute();
    return c.json({ success: true }, 200);
  } catch (err) {
    const msg = toErrorMessage(err);
    consola.error("Failed to delete sandbox:", msg);
    return c.json({ error: `Failed to delete sandbox: ${msg}` }, 500);
  }
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/ports", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  try {
    const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });
    const { port } = await c.req.json<{ port: number }>();

    if (!port || port < 1025 || port > 65535 || port === 3000) {
      return c.json({ error: "Invalid port number" }, 400);
    }

    const { hostname } = new URL(c.req.url);
    const previewUrl = await sandbox.expose(port, hostname);
    return c.json({ previewUrl });
  } catch (err) {
    const msg = toErrorMessage(err);
    consola.error(c.req.param("sandboxId"), "Failed to expose port:", msg);
    return c.json({ error: `Failed to expose port: ${msg}` }, 500);
  }
});

sandboxRoutes.delete("/v1/sandboxes/:sandboxId/ports", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  try {
    const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });
    const port = parseInt(c.req.query("port") || "0", 10);

    if (!port || port < 1024 || port > 65535 || port === 3000) {
      return c.json({ error: "Invalid port number" }, 400);
    }

    await sandbox.unexpose(port);
    return c.json({});
  } catch (err) {
    const msg = toErrorMessage(err);
    consola.error(c.req.param("sandboxId"), "Failed to unexpose port:", msg);
    return c.json({ error: `Failed to unexpose port: ${msg}` }, 500);
  }
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/vscode", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  try {
    const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });
    const { hostname } = new URL(c.req.url);
    const previewUrl = await sandbox.exposeVscode(hostname);
    return c.json({ previewUrl });
  } catch (err) {
    const msg = toErrorMessage(err);
    consola.error(c.req.param("sandboxId"), "Failed to expose vscode:", msg);
    return c.json({ error: `Failed to expose vscode: ${msg}` }, 500);
  }
});

sandboxRoutes.delete("/v1/sandboxes/:sandboxId/vscode", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  try {
    const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });
    await sandbox.unexposeVscode();
    return c.json({});
  } catch (err) {
    const msg = toErrorMessage(err);
    consola.error(c.req.param("sandboxId"), "Failed to unexpose vscode:", msg);
    return c.json({ error: `Failed to unexpose vscode: ${msg}` }, 500);
  }
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/services/:serviceId", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  try {
    const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });

    const [service] = await c.var.db
      .select()
      .from(services)
      .where(
        and(
          eq(services.id, c.req.param("serviceId")),
          eq(services.sandboxId, record.id),
        ),
      )
      .execute();

    if (!service) return c.json({ error: "Service not found" }, 404);
    if (service.status === "RUNNING") return c.json({});

    const serviceId = await sandbox.startService(service.command);
    await c.var.db
      .update(services)
      .set({ serviceId, status: "RUNNING" })
      .where(eq(services.id, service.id))
      .execute();

    return c.json({ serviceId });
  } catch (err) {
    console.log("Failed to start service:", err);
  }

  return c.json({});
});

sandboxRoutes.delete("/v1/sandboxes/:sandboxId/services/:serviceId", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  try {
    const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });

    const [service] = await c.var.db
      .select()
      .from(services)
      .where(
        and(
          eq(services.id, c.req.param("serviceId")),
          eq(services.sandboxId, record.id),
        ),
      )
      .execute();

    if (!service) return c.json({ error: "Service not found" }, 404);
    if (service.status !== "RUNNING" || !service.serviceId) return c.json({});

    await sandbox.stopService(service.serviceId!);
    await c.var.db
      .update(services)
      .set({ status: "STOPPED" })
      .where(eq(services.id, service.id))
      .execute();
  } catch (err) {
    console.log("Failed to stop service:", err);
  }

  return c.json({});
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/pull-directory", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  const token = c.req.header("Authorization");
  const params = await c.req.json<PullDirectoryParams>();
  await pullSchema.parseAsync(params);

  const outdir = crypto.randomUUID();
  const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });

  await sandbox.sh`mkdir -p /tmp/${outdir} && cd /tmp/${outdir} && curl https://sandbox.pocketenv.io/cp/${params.uuid} -H "Authorization: ${token}" --output - | tar xzvf -`;
  await sandbox.sh`mkdir -p ${params.directoryPath} || sudo mkdir -p ${params.directoryPath}`;
  await sandbox.sh`(shopt -s dotglob && cp -r /tmp/${outdir}/* ${params.directoryPath}) || (shopt -s dotglob && sudo cp -r /tmp/${outdir}/* ${params.directoryPath})`;

  return c.json({ success: true });
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/push-directory", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  const params = await c.req.json<PushDirectoryParams>();
  await pushSchema.parseAsync(params);

  const token = c.req.header("Authorization");
  const uuid = crypto.randomUUID();

  const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });
  await sandbox.sh`cd /tmp && tar czvf ${uuid}.tar.gz -C $(dirname ${params.directoryPath}) $(basename ${params.directoryPath}) && curl -X POST "https://sandbox.pocketenv.io/cp?uuid=${uuid}" -H "Authorization: ${token}" -F "file=@${uuid}.tar.gz" && rm ${uuid}.tar.gz`;

  return c.json({ uuid });
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/backup", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  const params = await c.req.json<BackupParams>();

  const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });
  const backupId = await sandbox.backup(params.directory, params.ttl);

  await c.var.db.insert(backups).values({
    backupId,
    sandboxId: record.id,
    directory: params.directory,
    expiresAt: params.ttl ? dayjs().add(params.ttl, "second").toDate() : dayjs().add(3, "days").toDate(),
  }).execute();

  return c.json({ backupId });
});

sandboxRoutes.post("/v1/sandboxes/:sandboxId/restore", async (c) => {
  const result = await getSandboxRecord(c.var.db, c.req.param("sandboxId"));
  const record = result?.sandbox;

  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (record.provider !== "cloudflare") return c.json({ error: "Sandbox provider not supported" }, 400);

  const params = await c.req.json<RestoreParams>();

  const [backup] = await c.var.db.select().from(backups)
    .where(
      and(
        eq(backups.id, params.backupId),
        eq(backups.sandboxId, record.id),
      ),
    )
    .execute();

  if (!backup) return c.json({ error: "Backup not found" }, 404);

  const sandbox = await createSandbox("cloudflare", { id: record.sandboxId! });
  await sandbox.restore(backup.backupId, backup.directory);

  return c.json({ success: true });
});
