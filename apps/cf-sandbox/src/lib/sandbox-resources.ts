import { and, eq } from "drizzle-orm";
import { Context } from "../context";
import {
  files,
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
} from "../schema";
import sandboxes from "../schema/sandboxes";
import services from "../schema/services";
import { BaseSandbox } from "../providers";
import { SelectSandbox } from "../schema/sandboxes";
import decrypt from "./decrypt";

export async function fetchSandboxResources(
  db: Context["db"],
  sandboxId: string,
) {
  const [vars, secs, fils, sshKeyList, tailscaleKeys, volumes, ports, serviceList] =
    await Promise.all([
      db
        .select()
        .from(sandboxVariables)
        .leftJoin(variables, eq(variables.id, sandboxVariables.variableId))
        .where(eq(sandboxVariables.sandboxId, sandboxId))
        .execute(),
      db
        .select()
        .from(sandboxSecrets)
        .leftJoin(secrets, eq(secrets.id, sandboxSecrets.secretId))
        .where(eq(sandboxSecrets.sandboxId, sandboxId))
        .execute(),
      db
        .select()
        .from(sandboxFiles)
        .leftJoin(files, eq(files.id, sandboxFiles.fileId))
        .where(eq(sandboxFiles.sandboxId, sandboxId))
        .execute(),
      db
        .select()
        .from(sshKeys)
        .where(eq(sshKeys.sandboxId, sandboxId))
        .execute(),
      db
        .select()
        .from(tailscaleAuthKeys)
        .where(eq(tailscaleAuthKeys.sandboxId, sandboxId))
        .execute(),
      db
        .select()
        .from(sandboxVolumes)
        .leftJoin(sandboxes, eq(sandboxVolumes.sandboxId, sandboxes.id))
        .leftJoin(users, eq(sandboxes.userId, users.id))
        .where(eq(sandboxVolumes.sandboxId, sandboxId))
        .execute(),
      db
        .select()
        .from(sandboxPorts)
        .leftJoin(sandboxes, eq(sandboxPorts.sandboxId, sandboxes.id))
        .leftJoin(users, eq(sandboxes.userId, users.id))
        .where(eq(sandboxPorts.sandboxId, sandboxId))
        .execute(),
      db
        .select()
        .from(services)
        .where(eq(services.sandboxId, sandboxId))
        .execute(),
    ]);

  return { vars, secs, fils, sshKeyList, tailscaleKeys, volumes, ports, serviceList };
}

export type SandboxResources = Awaited<ReturnType<typeof fetchSandboxResources>>;

export async function buildSandboxEnvs(
  resources: Pick<SandboxResources, "vars" | "secs">,
): Promise<Record<string, string>> {
  return {
    ...resources.vars
      .map(({ variables: v }) => v)
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
        resources.secs
          .map(({ secrets: s }) => s)
          .filter((s) => s !== null)
          .map(async (s) => [s.name, await decrypt(s.value)] as const),
      ),
    ),
  };
}

/** Write files, set up SSH keys, configure Tailscale, and mount volumes. */
export async function scheduleInfraSetup(
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  sandbox: BaseSandbox,
  resources: Pick<SandboxResources, "fils" | "sshKeyList" | "tailscaleKeys" | "volumes">,
): Promise<void> {
  ctx.waitUntil(
    Promise.all([
      ...resources.fils
        .filter((x) => x.files !== null)
        .map(async (record) =>
          sandbox.writeFile(
            record.sandbox_files.path,
            await decrypt(record.files!.content),
          ),
        ),
      ...resources.sshKeyList.map(async (record) =>
        sandbox.setupSshKeys(
          await decrypt(record.privateKey),
          record.publicKey,
        ),
      ),
      resources.tailscaleKeys.length > 0 &&
        sandbox.setupTailscale(await decrypt(resources.tailscaleKeys[0].authKey)),
      ...resources.volumes.map((volume) =>
        sandbox.mount(
          volume.sandbox_volumes.path,
          `/${volume.users?.did || ""}${volume.users?.did ? "/" : ""}${volume.sandbox_volumes.id}/`,
        ),
      ),
    ]),
  );
}

/** Expose sandbox ports and persist the resulting preview URLs to the database. */
export async function exposePortsAndUpdate(
  db: Context["db"],
  sandbox: BaseSandbox,
  hostname: string,
  record: SelectSandbox,
  ports: SandboxResources["ports"],
): Promise<void> {
  const previewUrls = await Promise.all(
    ports.map((port) =>
      sandbox.expose(port.sandbox_ports.exposedPort, hostname),
    ),
  );

  await Promise.all(
    previewUrls.map((url, i) => {
      if (url) {
        return db
          .update(sandboxPorts)
          .set({ previewUrl: url })
          .where(
            and(
              eq(sandboxPorts.sandboxId, record.id),
              eq(sandboxPorts.exposedPort, ports[i].sandbox_ports.exposedPort),
            ),
          )
          .execute();
      }
    }),
  );
}

/** Start all services for a sandbox and mark them as RUNNING in the database. */
export async function startAndTrackServices(
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  db: Context["db"],
  sandbox: BaseSandbox,
  serviceList: SandboxResources["serviceList"],
): Promise<void> {
  ctx.waitUntil(
    Promise.all(
      serviceList.map(async (service) => {
        const id = await sandbox.startService(service.command);
        if (id) {
          await db
            .update(services)
            .set({ serviceId: id, status: "RUNNING" })
            .where(eq(services.id, service.id))
            .execute();
        }
      }),
    ),
  );
}
