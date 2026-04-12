import { eq } from "drizzle-orm";
import type { Context } from "../context";
import {
  sandboxes,
  spriteAuth,
  daytonaAuth,
  denoAuth,
  vercelAuth,
  modalAuth,
  e2bAuth,
  hopxAuth,
  runloopAuth,
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
import { env } from "node:process";

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
  e2bAuthParams?: {
    apiKey?: string;
  } | null;
  hopxAuthParams?: {
    apiKey?: string;
  } | null;
  runloopAuthParams?: {
    apiKey?: string;
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
    [e2bAuthParams],
    [hopxAuthParams],
    [runloopAuthParams],
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
    db
      .select()
      .from(e2bAuth)
      .where(eq(e2bAuth.sandboxId, sandboxDbId))
      .execute(),
    db
      .select()
      .from(hopxAuth)
      .where(eq(hopxAuth.sandboxId, sandboxDbId))
      .execute(),
    db
      .select()
      .from(runloopAuth)
      .where(eq(runloopAuth.sandboxId, sandboxDbId))
      .execute(),
  ]);
  return {
    spriteAuthParams,
    daytonaAuthParams,
    denoAuthParams,
    vercelAuthParams,
    modalAuthParams,
    e2bAuthParams,
    hopxAuthParams,
    runloopAuthParams,
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
    e2bApiKey: decrypt(auth.e2bAuthParams?.apiKey),
    hopxApiKey: decrypt(auth.hopxAuthParams?.apiKey),
    runloopApiKey: decrypt(auth.runloopAuthParams?.apiKey),
    blaxelApiKey: env.BL_API_KEY,
    blaxelWorkspace: env.BL_WORKSPACE,
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
      blaxelName: record.name,
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

  return getSandboxById(record.provider as Provider, record.sandboxId!, {
    modalAppName: record.name,
    blaxelName: record.name,
    ...credentials,
  });
}
