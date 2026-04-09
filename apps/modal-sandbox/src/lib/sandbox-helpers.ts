import { eq } from "drizzle-orm";
import type { Context } from "../context";
import {
  sandboxes,
  spriteAuth,
  daytonaAuth,
  denoAuth,
  vercelAuth,
  modalAuth,
} from "../schema";
import {
  BaseSandbox,
  createSandbox,
  getSandboxById,
  type Provider,
  type SandboxOptions,
} from "../providers";
import type { SelectSandbox } from "../schema/sandboxes";
import decrypt from "./decrypt";

export interface AuthParams {
  spriteAuthParams?: { spriteToken?: string } | null;
  daytonaAuthParams?: { apiKey?: string; organizationId?: string } | null;
  denoAuthParams?: { deployToken?: string } | null;
  vercelAuthParams?: {
    vercelToken?: string;
    projectId?: string;
    teamId?: string;
  } | null;
  modalAuthParams?: {
    tokenId?: string;
    tokenSecret?: string;
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
    [modalAuthParams],
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
    db
      .select()
      .from(modalAuth)
      .where(eq(modalAuth.sandboxId, sandboxDbId))
      .execute(),
  ]);
  return {
    spriteAuthParams,
    daytonaAuthParams,
    denoAuthParams,
    vercelAuthParams,
    modalAuthParams,
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
    modalTokenId: decrypt(auth.modalAuthParams?.tokenId),
    modalTokenSecret: decrypt(auth.modalAuthParams?.tokenSecret),
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
      modalAppName: record.name,
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
