/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";

export interface ProfileViewDetailed {
  /** The unique identifier of the actor. */
  id?: string;
  /** The DID of the actor. */
  did?: string;
  /** The handle of the actor. */
  handle?: string;
  /** The display name of the actor. */
  displayName?: string;
  /** The URL of the actor's avatar image. */
  avatar?: string;
  /** The date and time when the actor was created. */
  createdAt?: string;
  /** The date and time when the actor was last updated. */
  updatedAt?: string;
  [k: string]: unknown;
}

export function isProfileViewDetailed(v: unknown): v is ProfileViewDetailed {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.actor.defs#profileViewDetailed"
  );
}

export function validateProfileViewDetailed(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.actor.defs#profileViewDetailed", v);
}
