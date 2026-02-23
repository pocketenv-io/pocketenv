/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";

export interface Secret {
  /** Name of the secret, e.g. 'DATABASE_URL', 'SSH_KEY', etc. */
  name: string;
  /** Value of the secret. This will be encrypted at rest and redacted in any API responses. */
  value: string;
  [k: string]: unknown;
}

export function isSecret(v: unknown): v is Secret {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.secret.defs#secret"
  );
}

export function validateSecret(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.secret.defs#secret", v);
}

export type Secrets = Secret[];
