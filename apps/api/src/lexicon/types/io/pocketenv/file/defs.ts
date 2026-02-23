/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";

export interface File {
  /** The file path within the sandbox, e.g. '/app/config.json', '/home/user/.ssh/id_rsa', etc. */
  path: string;
  /** The content of the file. This will be written to the specified path within the sandbox. The content should be base64 encoded if it's binary data. */
  content: string;
  [k: string]: unknown;
}

export function isFile(v: unknown): v is File {
  return (
    isObj(v) && hasProp(v, "$type") && v.$type === "io.pocketenv.file.defs#file"
  );
}

export function validateFile(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.file.defs#file", v);
}

export type Files = File[];
