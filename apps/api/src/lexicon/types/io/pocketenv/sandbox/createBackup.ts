/**
 * GENERATED CODE - DO NOT MODIFY
 */
import type express from "express";
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";
import { type HandlerAuth, HandlerPipeThrough } from "@atproto/xrpc-server";

export interface QueryParams {
  /** The sandbox ID. */
  id: string;
}

export interface InputSchema {
  /** The directory to backup. */
  directory: string;
  /** An optional description for the backup. */
  description?: string;
  /** The time-to-live (TTL) for the backup in seconds. After this time, the backup will be automatically deleted. If not provided, the backup will expire after 3 days. */
  ttl?: number;
  [k: string]: unknown;
}

export interface HandlerInput {
  encoding: "application/json";
  body: InputSchema;
}

export interface HandlerError {
  status: number;
  message?: string;
}

export type HandlerOutput = HandlerError | void;
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
