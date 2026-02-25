/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";

export interface VolumeView {
  /** Unique identifier of the volume. */
  id?: string;
  /** Name of the volume, e.g. 'data-volume', 'logs', etc. */
  name?: string;
  [k: string]: unknown;
}

export function isVolumeView(v: unknown): v is VolumeView {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.volume.defs#volumeView"
  );
}

export function validateVolumeView(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.volume.defs#volumeView", v);
}

export type Volumes = Volume[];

export interface Volume {
  /** The ID of the sandbox to which the volume belongs. This is used to associate the volume with a specific sandbox environment. */
  sandboxId?: string;
  /** Name of the volume, e.g. 'data-volume', 'logs', etc. */
  name: string;
  /** The path within the sandbox where the volume will be mounted, e.g. '/data', '/logs', etc. */
  path?: string;
  /** Whether the volume should be mounted as read-only within the sandbox. Defaults to false (read-write). */
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
