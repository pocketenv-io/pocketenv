import { eq } from "drizzle-orm";
import { Context } from "../context.ts";
import {
  sandboxes,
  spriteAuth,
  daytonaAuth,
  denoAuth,
  vercelAuth,
} from "../schema/mod.ts";
import {
  BaseSandbox,
  createSandbox,
  getSandboxById,
  Provider,
  SandboxOptions,
} from "../providers/mod.ts";
import { SelectSandbox } from "../schema/sandboxes.ts";
import decrypt from "./decrypt.ts";

export interface AuthParams {
  spriteAuthParams?: { spriteToken?: string } | null;
  daytonaAuthParams?: { apiKey?: string; organizationId?: string } | null;
  denoAuthParams?: { deployToken?: string } | null;
  vercelAuthParams?: {
    vercelToken?: string;
    projectId?: string;
    teamId?: string;
  } | null;
}

export async function getAuthParams(
  db: Context["db"],
  sandboxDbId: string,
): Promise<AuthParams> {
  const [
    [spriteAuthParams],
    [daytonaAuthParams],
    [denoAuthParams],
    [vercelAuthParams],
  ] = await Promise.all([
    db
      .select()
      .from(spriteAuth)
      .where(eq(spriteAuth.sandboxId, sandboxDbId))
      .execute(),
    db
      .select()
      .from(daytonaAuth)
      .where(eq(daytonaAuth.sandboxId, sandboxDbId))
      .execute(),
    db
      .select()
      .from(denoAuth)
      .where(eq(denoAuth.sandboxId, sandboxDbId))
      .execute(),
    db
      .select()
      .from(vercelAuth)
      .where(eq(vercelAuth.sandboxId, sandboxDbId))
      .execute(),
  ]);
  return {
    spriteAuthParams,
    daytonaAuthParams,
    denoAuthParams,
    vercelAuthParams,
  };
}

export function buildCredentials(auth: AuthParams): SandboxOptions {
  return {
    daytonaApiKey: decrypt(auth.daytonaAuthParams?.apiKey),
    organizationId: auth.daytonaAuthParams?.organizationId,
    spriteToken: decrypt(auth.spriteAuthParams?.spriteToken),
    denoDeployToken: decrypt(auth.denoAuthParams?.deployToken),
    vercelApiToken: decrypt(auth.vercelAuthParams?.vercelToken),
    vercelProjectId: auth.vercelAuthParams?.projectId,
    vercelTeamId: auth.vercelAuthParams?.teamId,
  };
}

export async function resolveSandboxInstance(
  db: Context["db"],
  record: SelectSandbox,
  credentials: SandboxOptions,
): Promise<BaseSandbox> {
  if (!record.sandboxId) {
    const sandbox = await createSandbox(record.provider as Provider, {
      id: record.id,
      ...credentials,
    });
    const sandboxId = await sandbox.id();
    await db
      .update(sandboxes)
      .set({ sandboxId })
      .where(eq(sandboxes.id, record.id))
      .execute();
    record.sandboxId = sandboxId;
  }

  return getSandboxById(
    record.provider as Provider,
    record.sandboxId!,
    credentials,
  );
}
