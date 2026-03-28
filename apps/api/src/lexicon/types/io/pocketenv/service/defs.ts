/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";

export interface ServiceView {
  /** Unique identifier of the service. */
  id?: string;
  /** Name of the service. */
  name?: string;
  /** Command to run the service. */
  command?: string;
  /** Description of the service. */
  description?: string;
  ports?: number[];
  createdAt?: string;
  updatedAt?: string;
  [k: string]: unknown;
}

export function isServiceView(v: unknown): v is ServiceView {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.service.defs#serviceView"
  );
}

export function validateServiceView(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.service.defs#serviceView", v);
}

export interface Service {
  /** Name of the service. */
  name: string;
  /** Command to run the service. */
  command: string;
  /** Description of the service. */
  description?: string;
  ports?: number[];
  [k: string]: unknown;
}

export function isService(v: unknown): v is Service {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.service.defs#service"
  );
}

export function validateService(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.service.defs#service", v);
}
