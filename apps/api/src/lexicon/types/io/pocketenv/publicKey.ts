/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../lexicons";
import { isObj, hasProp } from "../../../util";
import { CID } from "multiformats/cid";

export interface Record {
  /** Name of the public key */
  name: string;
  /** The public key value, e.g. an SSH public key string. */
  key: string;
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    (v.$type === "io.pocketenv.publicKey#main" ||
      v.$type === "io.pocketenv.publicKey")
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.publicKey#main", v);
}
