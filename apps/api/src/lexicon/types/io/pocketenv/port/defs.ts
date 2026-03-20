/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";

/** A view of a port exposed by a sandbox. */
export interface PortView {
  /** The port number. */
  port?: number;
  /** A description of the port. */
  description?: string;
  /** A URL for previewing the service running on the port */
  previewUrl?: string;
  [k: string]: unknown;
}

export function isPortView(v: unknown): v is PortView {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.port.defs#portView"
  );
}

export function validatePortView(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.port.defs#portView", v);
}
