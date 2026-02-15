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
