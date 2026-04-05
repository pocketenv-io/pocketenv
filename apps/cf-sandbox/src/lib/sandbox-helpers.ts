import {
  and,
  eq,
  ExtractTablesWithRelations,
  isNull,
  or,
} from "drizzle-orm";
import { Context } from "../context";
import {
  sandboxes,
  sandboxSecrets,
  sandboxVariables,
  secrets,
  users,
  variables,
} from "../schema";
import { BaseSandbox, createSandbox } from "../providers";
import { SelectSandbox } from "../schema/sandboxes";
import { SelectUser } from "../schema/users";
import crypto from "node:crypto";
import { consola } from "consola";
import { PgTransaction } from "drizzle-orm/pg-core";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";

export type SandboxRecord = {
  sandbox: SelectSandbox;
  user: SelectUser | null;
};

/** Look up a sandbox by id/sandboxId/name, returning the record and its owner. */
export async function getSandboxRecord(
  db: Context["db"],
  sandboxId: string,
): Promise<SandboxRecord | undefined> {
  const [row] = await db
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
  if (!row) return undefined;
  return { sandbox: row.sandboxes, user: row.users };
}

export async function getCloudflareInstance(
  sandboxId: string,
  opts?: { memory?: string; keepAlive?: boolean; sleepAfter?: string },
): Promise<BaseSandbox> {
  return createSandbox("cloudflare", { id: sandboxId, ...opts });
}

export function generateSandboxId(): string {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(16)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}

export function scheduleRepoClone(
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  sandbox: BaseSandbox,
  repo: string,
): void {
  ctx.waitUntil(
    sandbox
      .clone(repo)
      .then(() =>
        consola.success(`Git Repository successfully cloned: ${repo}`),
      )
      .catch((e) => consola.error(`Failed to Clone Repository: ${e}`)),
  );
}

export function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

/**
 * Assigns a sandboxId to a sandbox record that doesn't have one yet.
 * No-op when the record already has a sandboxId.
 */
export async function ensureSandboxId(
  db: Context["db"],
  routeId: string,
  sandboxId: string,
): Promise<void> {
  await db
    .update(sandboxes)
    .set({ sandboxId })
    .where(
      and(
        or(
          eq(sandboxes.id, routeId),
          eq(sandboxes.sandboxId, routeId),
          eq(sandboxes.name, routeId),
        ),
        isNull(sandboxes.sandboxId),
        eq(sandboxes.provider, "cloudflare"),
      ),
    )
    .execute();
}

type Tx = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

export async function saveSecrets(
  tx: Tx,
  sandbox: SelectSandbox,
  values: { secrets: { name: string; value: string }[] },
): Promise<void> {
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
}

export async function saveVariables(
  tx: Tx,
  sandbox: SelectSandbox,
  values: { variables: { name: string; value: string }[] },
): Promise<void> {
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
}
