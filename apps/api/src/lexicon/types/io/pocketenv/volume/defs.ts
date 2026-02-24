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
  /** Name of the volume, e.g. 'data-volume', 'logs', etc. */
  name: string;
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
