/**
 * GENERATED CODE - DO NOT MODIFY
 */
import type express from "express";
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";
import type { HandlerAuth, HandlerPipeThrough } from "@atproto/xrpc-server";
import type * as IoPocketenvSandboxDefs from "./defs";

export type QueryParams = {};

export interface InputSchema {
  /** The base sandbox URI to clone from, e.g. a template or an existing sandbox. */
  base: string;
  /** The name of the sandbox */
  name?: string;
  /** A description for the sandbox */
  description?: string;
  /** The provider to create the sandbox on, e.g. 'daytona', 'vercel', 'cloudflare', etc. */
  provider?: "daytona" | "vercel" | "cloudflare" | "deno" | "sprites";
  /** A list of topics/tags to associate with the sandbox */
  topics?: string[];
  /** A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo. */
  repo?: string;
  /** The number of virtual CPUs to allocate for the sandbox */
  vcpus?: number;
  /** The amount of memory (in GB) to allocate for the sandbox */
  memory?: number;
  /** The amount of disk space (in GB) to allocate for the sandbox */
  disk?: number;
  /** A URI to a README for the sandbox. */
  readme?: string;
  secrets?: IoPocketenvSandboxDefs.Secrets;
  envs?: IoPocketenvSandboxDefs.Envs;
  /** Prevent the sandbox from being automatically stop after a period of inactivity. Use with caution, as this may lead to increased costs. */
  keepAlive?: boolean;
  /** A token (encrypted) for accessing sprite resources */
  spriteToken?: string;
  /** A redacted token for accessing sprite resources */
  redactedSpriteToken?: string;
  /** A token (encrypted) for accessing Deno Deploy resources */
  denoDeployToken?: string;
  /** A redacted token for accessing Deno Deploy resources */
  redactedDenoDeployToken?: string;
  /** A token (encrypted) for accessing Daytona resources */
  daytonaApiKey?: string;
  /** A redacted token for accessing Daytona resources */
  redactedDaytonaApiKey?: string;
  /** The organization ID for Daytona resources */
  daytonaOrganizationId?: string;
  /** A token (encrypted) for accessing Vercel resources */
  vercelApiToken?: string;
  /** A redacted token for accessing Vercel resources */
  redactedVercelApiToken?: string;
  /** The project ID for Vercel resources */
  vercelProjectId?: string;
  /** The team ID for Vercel resources */
  vercelTeamId?: string;
  [k: string]: unknown;
}

export type OutputSchema = IoPocketenvSandboxDefs.SandboxViewBasic;

export interface HandlerInput {
  encoding: "application/json";
  body: InputSchema;
}

export interface HandlerSuccess {
  encoding: "application/json";
  body: OutputSchema;
  headers?: { [key: string]: string };
}

export interface HandlerError {
  status: number;
  message?: string;
}

export type HandlerOutput = HandlerError | HandlerSuccess | HandlerPipeThrough;
export type HandlerReqCtx<HA extends HandlerAuth = never> = {
  auth: HA;
  params: QueryParams;
  input: HandlerInput;
  req: express.Request;
  res: express.Response;
  resetRouteRateLimits: () => Promise<void>;
};
export type Handler<HA extends HandlerAuth = never> = (
  ctx: HandlerReqCtx<HA>,
) => Promise<HandlerOutput> | HandlerOutput;
