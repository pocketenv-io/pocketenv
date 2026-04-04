import { Hono } from "hono";
import { cors } from "hono/cors";
import { Context } from "./context";
import { getSandbox, proxyToSandbox, Sandbox } from "@cloudflare/sandbox";
import {
  files,
  sandboxCp,
  sandboxes,
  sandboxFiles,
  sandboxPorts,
  sandboxSecrets,
  sandboxVariables,
  sandboxVolumes,
  secrets,
  sshKeys,
  tailscaleAuthKeys,
  users,
  variables,
} from "./schema";
import {
  adjectives,
  nouns,
  generateUniqueAsync,
} from "unique-username-generator";
import { and, eq, ExtractTablesWithRelations, isNull, or } from "drizzle-orm";
import { getConnection } from "./drizzle";
import { env } from "cloudflare:workers";
import {
  SandboxConfig,
  SandboxConfigSchema,
  StartSandboxConfig,
  StartSandboxConfigSchema,
} from "./types/sandbox";
import { BaseSandbox, createSandbox } from "./providers";
import { SelectSandbox } from "./schema/sandboxes";
import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { consola } from "consola";
import decrypt from "./lib/decrypt";
import crypto from "node:crypto";
import services from "./schema/services";
import { PushDirectoryParams, pushSchema } from "./types/push";
import { PullDirectoryParams, pullSchema } from "./types/pull";

type Bindings = {
  Sandbox: DurableObjectNamespace<Sandbox<Env>>;
};

const app = new Hono<{ Variables: Context; Bindings: Bindings }>();

app.use(cors());

app.use("*", async (c, next) => {
  const proxyResponse = await proxyToSandbox(c.req.raw, c.env);
  if (proxyResponse) return proxyResponse;

  c.set("db", getConnection());
  const token = c.req.header("Authorization")?.split(" ")[1]?.trim();
  if (token) {
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET!);
      c.set(
        "did",
        decoded?.payload?.sub || (decoded?.payload as { did: string })?.did,
      );
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

app.post("/cp", async (c) => {
  if (!c.var.did) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  const fileBuffer = await file.arrayBuffer();
  const uuid = c.req.query("uuid") || crypto.randomUUID();
  await env.POCKETENV_COPY.put(uuid, fileBuffer);

  c.executionCtx.waitUntil(
    c.var.db
      .insert(sandboxCp)
      .values({
        copyUuid: uuid,
      })
      .execute(),
  );

  return c.json({ uuid });
});

app.get("/cp/:uuid", async (c) => {
  const { uuid } = c.req.param();
  const file = await env.POCKETENV_COPY.get(uuid);
  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  await c.var.db
    .delete(sandboxCp)
    .where(eq(sandboxCp.copyUuid, uuid))
    .execute();

  await env.POCKETENV_COPY.delete(uuid);

  return c.body(file.body, 200, {
    "Content-Type": "application/gzip",
    "Content-Disposition": `attachment; filename="${uuid}.tar.gz"`,
  });
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
    }

    const record = await c.var.db.transaction(async (tx) => {
      const user = await tx
        .select()
        .from(users)
        .where(eq(users.did, c.var.did || ""))
        .execute()
        .then(([row]) => row);

      let record: SelectSandbox | undefined = undefined;
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

      if (params.secrets.length > 0) {
        await saveSecrets(tx, record!, { secrets: params.secrets });
      }

      if (params.variables.length > 0) {
        await saveVariables(tx, record!, { variables: params.variables });
      }

      const sandboxId = Array.from(
        crypto.getRandomValues(new Uint8Array(16)),
        (b) => b.toString(16).padStart(2, "0"),
      ).join("");

      const sandboxInstance = await createSandbox(params.provider, {
        id: sandboxId,
        keepAlive: params.keepAlive,
        sleepAfter: params.sleepAfter,
      });

      await sandboxInstance.start();

      [record] = await tx
        .update(sandboxes)
        .set({
          status: "RUNNING",
          sandboxId,
          startedAt: new Date(),
        })
        .where(eq(sandboxes.id, record!.id))
        .returning()
        .execute();

      if (params.repo) {
        c.executionCtx.waitUntil(
          sandboxInstance
            .clone(params.repo)
            .then(() =>
              consola.success(
                `Git Repository successfully cloned: ${params.repo}`,
              ),
            )
            .catch((e) => consola.error(`Failed to Clone Repository: ${e}`)),
        );
      }

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

  const body = await c.req.json<StartSandboxConfig>();
  const { repo, keepAlive } = StartSandboxConfigSchema.parse(body);

  if (!record) {
    return c.json({ error: "Sandbox not found" }, 404);
  }

  const sandboxId = Array.from(
    crypto.getRandomValues(new Uint8Array(16)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");

  await c.var.db
    .update(sandboxes)
    .set({ sandboxId: record.sandboxId || sandboxId })
    .where(
      and(
        or(
          eq(sandboxes.id, c.req.param("sandboxId")),
          eq(sandboxes.sandboxId, c.req.param("sandboxId")),
          eq(sandboxes.name, c.req.param("sandboxId")),
        ),
        isNull(sandboxes.sandboxId),
        eq(sandboxes.provider, "cloudflare"),
      ),
    )
    .returning()
    .execute();

  let sandbox: BaseSandbox | null = null;

  if (record.provider !== "cloudflare") {
    return c.json({ error: "Sandbox provider not supported" }, 400);
  }

  try {
    sandbox = await createSandbox("cloudflare", {
      id: record.sandboxId || sandboxId,
      memory: "4GiB",
      keepAlive,
    });

    if (!sandbox) {
      return c.json({ error: "Sandbox provider not supported" }, 400);
    }

    if (repo) {
      c.executionCtx.waitUntil(
        sandbox
          .clone(repo)
          .then(() =>
            consola.success(`Git Repository successfully cloned: ${repo}`),
          )
          .catch((e) => consola.error(`Failed to Clone Repository: ${e}`)),
      );
    }

    await c.var.db
      .update(sandboxes)
      .set({
        status: "RUNNING",
        sandboxId: record.sandboxId || sandboxId,
        startedAt: new Date(),
      })
      .where(eq(sandboxes.id, c.req.param("sandboxId")))
      .execute();

    const params = await Promise.all([
      c.var.db
        .select()
        .from(sandboxVariables)
        .leftJoin(variables, eq(variables.id, sandboxVariables.variableId))
        .where(eq(sandboxVariables.sandboxId, c.req.param("sandboxId")))
        .execute(),
      c.var.db
        .select()
        .from(sandboxSecrets)
        .leftJoin(secrets, eq(secrets.id, sandboxSecrets.secretId))
        .where(eq(sandboxSecrets.sandboxId, c.req.param("sandboxId")))
        .execute(),
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
        .leftJoin(sandboxes, eq(sandboxVolumes.sandboxId, sandboxes.id))
        .leftJoin(users, eq(sandboxes.userId, users.id))
        .where(eq(sandboxVolumes.sandboxId, c.req.param("sandboxId")))
        .execute(),
      c.var.db
        .select()
        .from(sandboxPorts)
        .leftJoin(sandboxes, eq(sandboxPorts.sandboxId, sandboxes.id))
        .leftJoin(users, eq(sandboxes.userId, users.id))
        .where(eq(sandboxPorts.sandboxId, c.req.param("sandboxId")))
        .execute(),
      c.var.db
        .select()
        .from(services)
        .where(eq(services.sandboxId, c.req.param("sandboxId")))
        .execute(),
    ]);

    c.executionCtx.waitUntil(
      sandbox.setEnvs({
        ...params[0]
          .map(({ variables }) => variables)
          .filter((v) => v !== null)
          .reduce(
            (acc, v) => {
              acc[v.name] = v.value;
              return acc;
            },
            {} as Record<string, string>,
          ),
        ...Object.fromEntries(
          await Promise.all(
            params[1]
              .map(({ secrets }) => secrets)
              .filter((v) => v !== null)
              .map(async (v) => [v.name, await decrypt(v.value)] as const),
          ),
        ),
      }),
    );

    c.executionCtx.waitUntil(
      sandbox.sh`[ -f /root/.ssh/id_ed25519 ] || ssh-keygen -t ed25519 -f /root/.ssh/id_ed25519 -q -N "" || true`,
    );

    const { hostname } = new URL(c.req.url);

    c.executionCtx.waitUntil(
      Promise.all([
        ...params[2]
          .filter((x) => x.files !== null)
          .map(async (record) =>
            sandbox?.writeFile(
              record.sandbox_files.path,
              await decrypt(record.files!.content),
            ),
          ),
        ...params[3].map(async (record) =>
          sandbox?.setupSshKeys(
            await decrypt(record.privateKey),
            record.publicKey,
          ),
        ),
        params[4].length > 0 &&
          sandbox?.setupTailscale(await decrypt(params[4][0].authKey)),
        ...params[5].map((volume) =>
          sandbox?.mount(
            volume.sandbox_volumes.path,
            `/${volume.users?.did || ""}${volume.users?.did ? "/" : ""}${volume.sandbox_volumes.id}/`,
          ),
        ),
      ]),
    );

    if (record.repo) {
      c.executionCtx.waitUntil(
        sandbox
          .clone(record.repo)
          .then(() =>
            consola.success(
              `Git Repository successfully cloned: ${record.repo}`,
            ),
          )
          .catch((e) => consola.error(`Failed to Clone Repository: ${e}`)),
      );
    }

    const previewUrls = await Promise.all(
      params[6].map((port) =>
        sandbox?.expose(port.sandbox_ports.exposedPort, hostname),
      ),
    );

    await Promise.all(
      previewUrls.map((url, i) => {
        if (url) {
          return c.var.db
            .update(sandboxPorts)
            .set({ previewUrl: url })
            .where(
              and(
                eq(sandboxPorts.sandboxId, record.id),
                eq(
                  sandboxPorts.exposedPort,
                  params[6][i].sandbox_ports.exposedPort,
                ),
              ),
            )
            .execute();
        }
      }),
    );

    c.executionCtx.waitUntil(
      Promise.all(
        params[7].map(async (service) => {
          const id = await sandbox?.startService(service.command);
          if (id) {
            await c.var.db
              .update(services)
              .set({ serviceId: id, status: "RUNNING" })
              .where(eq(services.id, service.id))
              .execute();
          }
        }),
      ),
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    consola.log("Failed to start sandbox:", errorMessage);
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

    if (!record.sandboxId) {
      return c.json({ error: "Sandbox is not running" }, 400);
    }

    sandbox = await createSandbox("cloudflare", {
      id: record.sandboxId,
    });

    if (!sandbox) {
      return c.json({ error: "Sandbox provider not supported" }, 400);
    }
    const volumes = await c.var.db
      .select()
      .from(sandboxVolumes)
      .where(eq(sandboxVolumes.sandboxId, c.req.param("sandboxId")))
      .execute();

    try {
      await Promise.all(volumes.map((volume) => sandbox?.unmount(volume.path)));
    } catch (e) {
      console.error(e);
    }

    await sandbox.stop();
    await Promise.all([
      c.var.db
        .update(sandboxes)
        .set({ status: "STOPPED" })
        .where(eq(sandboxes.id, c.req.param("sandboxId")))
        .execute(),
      c.var.db
        .update(services)
        .set({ status: "STOPPED" })
        .where(eq(services.sandboxId, c.req.param("sandboxId")))
        .execute(),
    ]);

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

  if (record.status !== "RUNNING") {
    return c.json({ error: "Sandbox is not running" }, 400);
  }

  try {
    let sandbox: BaseSandbox | null = null;

    sandbox = await createSandbox("cloudflare", {
      id: record.sandboxId!,
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
      id: record.sandboxId!,
    });

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

  const { sandboxes: record, users: user } = await getSandboxById(
    c.var.db,
    c.req.param("sandboxId"),
  );
  if (!record) {
    return c.text("Sandbox not found", 404);
  }

  if (token) {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET!);
    if (record.userId && user && user?.did !== decoded?.payload?.sub) {
      return c.text("Unauthorized", 403);
    }
  }

  if (!record.sandboxId) {
    return c.text("Sandbox not started", 400);
  }
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

app.post("/v1/sandboxes/:sandboxId/ports", async (c) => {
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
      id: record.sandboxId!,
    });

    const { port } = await c.req.json<{ port: number }>();

    if (!port || port < 1025 || port > 65535 || port == 3000) {
      return c.json({ error: "Invalid port number" }, 400);
    }

    const { hostname } = new URL(c.req.url);
    const previewUrl = await sandbox.expose(port, hostname);
    return c.json({ previewUrl });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    consola.error(
      c.req.param("sandboxId"),
      "Failed to expose port:",
      errorMessage,
    );
    return c.json({ error: `Failed to expose port: ${errorMessage}` }, 500);
  }
});

app.delete("/v1/sandboxes/:sandboxId/ports", async (c) => {
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
      id: record.sandboxId!,
    });

    const port = parseInt(c.req.query("port") || "0", 10);

    if (!port || port < 1024 || port > 65535 || port == 3000) {
      return c.json({ error: "Invalid port number" }, 400);
    }

    await sandbox.unexpose(port);
    return c.json({});
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    consola.error(
      c.req.param("sandboxId"),
      "Failed to unexpose port:",
      errorMessage,
    );
    return c.json({ error: `Failed to unexpose port: ${errorMessage}` }, 500);
  }
});

app.post("/v1/sandboxes/:sandboxId/vscode", async (c) => {
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
      id: record.sandboxId!,
    });

    const { hostname } = new URL(c.req.url);
    const previewUrl = await sandbox.exposeVscode(hostname);
    return c.json({ previewUrl });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    consola.error(
      c.req.param("sandboxId"),
      "Failed to expose vscode:",
      errorMessage,
    );
    return c.json({ error: `Failed to expose vscode: ${errorMessage}` }, 500);
  }
});

app.delete("/v1/sandboxes/:sandboxId/vscode", async (c) => {
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
      id: record.sandboxId!,
    });

    await sandbox.unexposeVscode();
    return c.json({});
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    consola.error(
      c.req.param("sandboxId"),
      "Failed to unexpose vscode:",
      errorMessage,
    );
    return c.json({ error: `Failed to unexpose vscode: ${errorMessage}` }, 500);
  }
});

app.post("/v1/sandboxes/:sandboxId/services/:serviceId", async (c) => {
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
      id: record.sandboxId!,
    });

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

    if (!service) {
      return c.json({ error: "Service not found" }, 404);
    }

    if (service.status === "RUNNING") {
      return c.json({});
    }

    const serviceId = await sandbox.startService(service.command);

    await c.var.db
      .update(services)
      .set({ serviceId, status: "RUNNING" })
      .where(eq(services.id, service.id))
      .execute();

    return c.json({ serviceId });
  } catch (err) {
    console.log(`Failed to start service:`, err);
  }

  return c.json({});
});

app.delete("/v1/sandboxes/:sandboxId/services/:serviceId", async (c) => {
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
      id: record.sandboxId!,
    });

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

    if (!service) {
      return c.json({ error: "Service not found" }, 404);
    }

    if (service.status !== "RUNNING" || !service.serviceId) {
      return c.json({});
    }

    await sandbox.stopService(service.serviceId!);

    await c.var.db
      .update(services)
      .set({ status: "STOPPED" })
      .where(eq(services.id, service.id))
      .execute();
  } catch (err) {
    console.log(`Failed to stop service:`, err);
  }
  return c.json({});
});

app.post("/v1/sandboxes/:sandboxId/pull-directory", async (c) => {
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

  const token = c.req.header("Authorization");
  const params = await c.req.json<PullDirectoryParams>();
  await pullSchema.parseAsync(params);

  const outdir = crypto.randomUUID();

  let sandbox: BaseSandbox | null = null;

  sandbox = await createSandbox("cloudflare", {
    id: record.sandboxId!,
  });
  await sandbox.sh`mkdir -p /tmp/${outdir} && cd /tmp/${outdir} && curl https://sandbox.pocketenv.io/cp/${params.uuid} -H "Authorization: ${token}" --output - | tar xzvf -`;
  await sandbox.sh`mkdir -p ${params.directoryPath} || sudo mkdir -p ${params.directoryPath}`;
  await sandbox.sh`cp -r /tmp/${outdir}/* ${params.directoryPath} || sudo cp -r /tmp/${outdir}/* ${params.directoryPath}`;

  return c.json({ success: true });
});

app.post("/v1/sandboxes/:sandboxId/push-directory", async (c) => {
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

  const params = await c.req.json<PushDirectoryParams>();
  await pushSchema.parseAsync(params);

  const token = c.req.header("Authorization");
  await pushSchema.parseAsync(params);
  const uuid = crypto.randomUUID();

  let sandbox: BaseSandbox | null = null;

  sandbox = await createSandbox("cloudflare", {
    id: record.sandboxId!,
  });
  await sandbox.sh`cd /tmp && tar czvf ${uuid}.tar.gz -C ${params.directoryPath} . && curl -X POST "https://sandbox.pocketenv.io/cp?uuid=${uuid}" -H "Authorization: ${token}" -F "file=@${uuid}.tar.gz" && rm ${uuid}.tar.gz`;

  return c.json({ uuid });
});

export const getSandboxById = async (db: Context["db"], sandboxId: string) => {
  const [record] = await db
    .select()
    .from(sandboxes)
    .leftJoin(users, eq(sandboxes.userId, users.id))
    .where(
      or(
        eq(sandboxes.id, sandboxId),
        eq(sandboxes.sandboxId, sandboxId),
        eq(sandboxes.name, sandboxId),
      ),
    )
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

export { Sandbox } from "@cloudflare/sandbox";

export default app;
