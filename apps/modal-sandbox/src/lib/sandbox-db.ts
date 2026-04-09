import type { Context } from "../context";
import { eq, or } from "drizzle-orm";
import {
  sandboxes,
  sandboxSecrets,
  sandboxVariables,
  secrets,
  variables,
} from "../schema";
import type { SelectSandbox } from "../schema/sandboxes";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { ExtractTablesWithRelations } from "drizzle-orm";

type Tx = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

export const getSandbox = async (db: Context["db"], sandboxId: string) => {
  const [record] = await db
    .select()
    .from(sandboxes)
    .where(or(eq(sandboxes.id, sandboxId), eq(sandboxes.sandboxId, sandboxId)))
    .execute();
  return record;
};

export const saveSecrets = async (
  tx: Tx,
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
  tx: Tx,
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
