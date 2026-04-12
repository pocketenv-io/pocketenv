import { Hono } from "hono";
import type { Context } from "../context";
import { consola } from "consola";
import {
  adjectives,
  nouns,
  generateUniqueAsync,
} from "unique-username-generator";
import { eq } from "drizzle-orm";
import {
  files,
  sandboxes,
  sandboxCp,
  sandboxFiles,
  sandboxVolumes,
  sshKeys,
  tailscaleAuthKeys,
  users,
  spriteAuth,
  denoAuth,
  vercelAuth,
  modalAuth,
  e2bAuth,
  runloopAuth,
  hopxAuth,
} from "../schema";
import {
  type SandboxConfig,
  SandboxConfigSchema,
  type StartSandboxInput,
  StartSandboxInputSchema,
} from "../types/sandbox";
import { createSandbox } from "../providers";
import { getSandbox, saveSecrets, saveVariables } from "../lib/sandbox-db";
import {
  getAuthParams,
  buildCredentials,
  resolveSandboxInstance,
} from "../lib/sandbox-helpers";
import decrypt from "../lib/decrypt";
import type { InsertSpriteAuth } from "../schema/sprite-auth";
import daytonaAuth, { type InsertDaytonaAuth } from "../schema/daytona-auth";
import type { InsertDenoAuth } from "../schema/deno-auth";
import { type PullDirectoryParams, pullSchema } from "../types/pull";
import { type PushDirectoryParams, pushSchema } from "../types/push";
import crypto from "node:crypto";
import process, { env } from "node:process";
import prepareSandbox from "../lib/prepare-sandbox";
import { images } from "../images";
import type { InsertSandbox } from "schema/sandboxes";

const SUPPORTED_PROVIDERS = [
  "daytona",
  "vercel",
  "deno",
  "sprites",
  "modal",
  "e2b",
  "hopx",
  "blaxel",
  "runloop",
];

const sandboxRouter = new Hono<{ Variables: Context }>();

sandboxRouter.post("/", async (c) => {
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
      if (existing.length === 0) break;

      name = await generateUniqueAsync(
        { dictionaries: [adjectives, nouns], separator: "-" },
        () => false,
      );
      suffix = Math.random().toString(36).substring(2, 6);
      name = `${name}-${suffix}`;
    } while (true);

    const { record: initialRecord, user } = await c.var.db.transaction(
      async (tx) => {
        const user = await tx
          .select()
          .from(users)
          .where(eq(users.did, c.var.did || ""))
          .execute()
          .then((res) => res[0]);

        const [record] = await tx
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
          await saveSecrets(tx, record!, { secrets: params.secrets });
        }

        if (params.variables.length > 0) {
          await saveVariables(tx, record!, { variables: params.variables });
        }

        if (params.spriteToken && user?.id) {
          await tx
            .insert(spriteAuth)
            .values({
              sandboxId: record!.id,
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
              sandboxId: record!.id,
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
              sandboxId: record!.id,
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
              sandboxId: record!.id,
              vercelToken: params.vercelApiToken,
              redactedVercelToken: params.redactedVercelApiToken ?? "",
              userId: user.id,
              projectId: params.vercelProjectId!,
              teamId: params.vercelTeamId!,
            })
            .execute();
        }

        if (params.modalTokenId && user?.id) {
          await tx
            .insert(modalAuth)
            .values({
              sandboxId: record!.id,
              tokenId: params.modalTokenId!,
              redactedTokenId: params.redactedModalTokenId!,
              tokenSecret: params.modalTokenSecret!,
              redactedTokenSecret: params.redactedModalTokenSecret!,
              userId: user.id,
            })
            .execute();
        }

        if (params.e2bApiKey && user?.id) {
          await tx
            .insert(e2bAuth)
            .values({
              sandboxId: record!.id,
              apiKey: params.e2bApiKey!,
              redactedApiKey: params.redactedE2bApiKey ?? "",
              userId: user.id,
            })
            .execute();
        }

        if (params.runloopApiKey && user?.id) {
          await tx
            .insert(runloopAuth)
            .values({
              sandboxId: record!.id,
              apiKey: params.runloopApiKey!,
              redactedApiKey: params.redactedRunloopApiKey ?? "",
              userId: user.id,
            })
            .execute();
        }

        if (params.hopxApiKey && user?.id) {
          await tx
            .insert(hopxAuth)
            .values({
              sandboxId: record!.id,
              apiKey: params.hopxApiKey!,
              redactedApiKey: params.redactedHopxApiKey ?? "",
              userId: user.id,
            })
            .execute();
        }

        return { record, user };
      },
    );

    new Promise<InsertSandbox>(async (resolve) => {
      const sandbox = await createSandbox(params.provider, {
        id: initialRecord?.id,
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
        modalTokenId: decrypt(params.modalTokenId),
        modalTokenSecret: decrypt(params.modalTokenSecret),
        image: images[params.base] || images["openclaw"],
        e2bApiKey: decrypt(params.e2bApiKey),
        hopxApiKey: decrypt(params.hopxApiKey),
        runloopApiKey: decrypt(params.runloopApiKey),
        blaxelApiKey: env.BL_API_KEY,
        blaxelWorkspace: env.BL_WORKSPACE,
        blaxelName: name,
      });
      const sandboxId = await sandbox.id();

      const [record] = await c.var.db
        .update(sandboxes)
        .set({
          status: "RUNNING",
          sandboxId: sandboxId,
          startedAt: new Date(),
          vcpus: params.vcpus,
          memory: params.memory,
          disk: params.disk,
        })
        .where(eq(sandboxes.id, initialRecord!.id))
        .returning()
        .execute();

      resolve(record!);
    })
      .then((record) => {
        consola.success(
          `Sandbox ${record.id} is running with ID ${record.sandboxId}`,
        );
      })
      .catch((e) => {
        consola.error(`Failed to start sandbox ${initialRecord?.id}: ${e}`);
      });

    return c.json(initialRecord);
  } catch (err) {
    console.log(err);
    return c.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      400,
    );
  }
});

sandboxRouter.get("/", async (c) => {
  const records = await c.var.db.select().from(sandboxes).execute();
  return c.json(records);
});

sandboxRouter.get("/:sandboxId", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));
  return c.json(record);
});

sandboxRouter.put("/:sandboxId", async (c) => {
  return c.json({});
});

sandboxRouter.post("/:sandboxId/start", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));
  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (!SUPPORTED_PROVIDERS.includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const { repo } = StartSandboxInputSchema.parse(
    await c.req.json<StartSandboxInput>(),
  );

  const auth = await getAuthParams(c.var.db, record.id);
  const credentials = buildCredentials(auth);
  const sandbox = await resolveSandboxInstance(c.var.db, record, credentials);

  await sandbox.start();

  // prepareSandbox in background since it can take a while and we want to return 200 OK as soon as possible to avoid timeouts on the client side
  prepareSandbox(sandbox, record.base || "openclaw")
    .then(() =>
      consola.success(`Sandbox ${c.req.param("sandboxId")} is prepared`),
    )
    .catch((e) =>
      consola.warn(
        `Failed to prepare sandbox ${c.req.param("sandboxId")}: ${e}`,
      ),
    );

  c.var.db
    .update(sandboxes)
    .set({
      sandboxId: await sandbox.id(),
    })
    .where(eq(sandboxes.id, record.id))
    .execute()
    .catch((e) =>
      consola.error(
        `Failed to update SSH info for sandbox ${c.req.param("sandboxId")}: ${e}`,
      ),
    );

  const [sandboxFileRecords, sshKeyRecords, tailscaleRecords, volumeRecords] =
    await Promise.all([
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

  Promise.all([
    sandbox.setupDefaultSshKeys(),
    ...sandboxFileRecords
      .filter((x) => x.files !== null)
      .map((r) =>
        sandbox.writeFile(r.sandbox_files.path, decrypt(r.files!.content)!),
      ),
    ...sshKeyRecords.map((r) =>
      sandbox.setupSshKeys(decrypt(r.privateKey)!, r.publicKey),
    ),
    tailscaleRecords.length > 0 &&
      sandbox.setupTailscale(decrypt(tailscaleRecords[0]?.authKey)!),
    ...volumeRecords.map((v) =>
      sandbox.mount(
        v.sandbox_volumes.path,
        `/${v.users?.did || ""}${v.users?.did ? "/" : ""}${v.sandbox_volumes.id}/`,
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
      sandboxId: ["deno", "modal", "e2b"].includes(record.provider)
        ? await sandbox.id()
        : record.sandboxId,
    })
    .where(eq(sandboxes.id, c.req.param("sandboxId")))
    .execute();

  return c.json({});
});

sandboxRouter.post("/:sandboxId/stop", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));
  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (!SUPPORTED_PROVIDERS.includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const auth = await getAuthParams(c.var.db, record.id);
  const sandbox = await resolveSandboxInstance(
    c.var.db,
    record,
    buildCredentials(auth),
  );

  await sandbox.stop();
  await c.var.db
    .update(sandboxes)
    .set({
      status: "STOPPED",
      sandboxId: ["deno", "vercel", "modal", "e2b", "runloop", "hopx"].includes(
        record.provider,
      )
        ? null
        : record.sandboxId,
    })
    .where(eq(sandboxes.id, c.req.param("sandboxId")))
    .execute();

  return c.json({});
});

sandboxRouter.post("/:sandboxId/runs", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));
  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (!SUPPORTED_PROVIDERS.includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const auth = await getAuthParams(c.var.db, record.id);
  const sandbox = await resolveSandboxInstance(
    c.var.db,
    record,
    buildCredentials(auth),
  );

  const { command } = await c.req.json();
  const res = await sandbox.sh`${command}`;
  return c.json(res);
});

sandboxRouter.delete("/:sandboxId", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));
  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (!SUPPORTED_PROVIDERS.includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const auth = await getAuthParams(c.var.db, record.id);
  const sandbox = await resolveSandboxInstance(
    c.var.db,
    record,
    buildCredentials(auth),
  );

  await sandbox.delete();
  await c.var.db
    .delete(sandboxes)
    .where(eq(sandboxes.id, c.req.param("sandboxId")))
    .execute();

  return c.json({ success: true }, 200);
});

sandboxRouter.get("/:sandboxId/ssh", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));
  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (!["daytona", "deno"].includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const auth = await getAuthParams(c.var.db, record.id);
  const sandbox = await resolveSandboxInstance(
    c.var.db,
    record,
    buildCredentials(auth),
  );

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

sandboxRouter.post("/:sandboxId/ports", async (c) => {
  // TODO: Implement expose port
  return c.json({});
});

sandboxRouter.delete("/:sandboxId/ports", async (c) => {
  // TODO: Implement unexpose port
  return c.json({});
});

sandboxRouter.post("/:sandboxId/pull-directory", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));
  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (!SUPPORTED_PROVIDERS.includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const auth = await getAuthParams(c.var.db, record.id);
  const sandbox = await resolveSandboxInstance(
    c.var.db,
    record,
    buildCredentials(auth),
  );

  const token = c.req.header("Authorization");
  const params = await c.req.json<PullDirectoryParams>();
  await pullSchema.parseAsync(params);

  const outdir = crypto.randomUUID();
  await sandbox.sh`mkdir -p /tmp/${outdir} && cd /tmp/${outdir} && curl https://sandbox.pocketenv.io/cp/${params.uuid} -H "Authorization: ${token}" --output - | tar xzvf -`;
  await sandbox.sh`mkdir -p ${params.directoryPath} || sudo mkdir -p ${params.directoryPath}`;
  await sandbox.sh`(shopt -s dotglob && cp -r /tmp/${outdir}/* ${params.directoryPath}) || (shopt -s dotglob && sudo cp -r /tmp/${outdir}/* ${params.directoryPath})`;

  await c.var.db
    .delete(sandboxCp)
    .where(eq(sandboxCp.copyUuid, params.uuid))
    .execute();

  return c.json({ success: true });
});

sandboxRouter.post("/:sandboxId/push-directory", async (c) => {
  const record = await getSandbox(c.var.db, c.req.param("sandboxId"));
  if (!record) return c.json({ error: "Sandbox not found" }, 404);
  if (!SUPPORTED_PROVIDERS.includes(record.provider)) {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  const auth = await getAuthParams(c.var.db, record.id);
  const sandbox = await resolveSandboxInstance(
    c.var.db,
    record,
    buildCredentials(auth),
  );

  const token = c.req.header("Authorization");
  const params = await c.req.json<PushDirectoryParams>();
  await pushSchema.parseAsync(params);

  const uuid = crypto.randomUUID();
  await sandbox.sh`cd /tmp && tar czvf ${uuid}.tar.gz -C $(dirname ${params.directoryPath}) $(basename ${params.directoryPath}) && curl -X POST "https://sandbox.pocketenv.io/cp?uuid=${uuid}" -H "Authorization: ${token}" -F "file=@${uuid}.tar.gz" && rm ${uuid}.tar.gz`;

  return c.json({ success: true, uuid: uuid.toString() });
});

export { sandboxRouter };
