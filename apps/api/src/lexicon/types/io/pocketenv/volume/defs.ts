/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";

export type Volumes = Volume[];

export interface Volume {
  /** Name of the volume, e.g. 'data-volume', 'logs', etc. */
  name: string;
  /** The mount path within the sandbox where the volume will be attached, e.g. '/data', '/logs', etc. */
  path?: string;
  /** Whether the volume should be mounted as read-only */
  readOnly?: boolean;
  [k: string]: unknown;
}

export function isVolume(v: unknown): v is Volume {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.volume.defs#volume"
  );
}

export function validateVolume(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.volume.defs#volume", v);
}
