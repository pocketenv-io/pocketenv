/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../lexicons";
import { isObj, hasProp } from "../../../util";
import { CID } from "multiformats/cid";
import type * as ComAtprotoRepoStrongRef from "../../com/atproto/repo/strongRef";

export interface Record {
  /** Name of the sandbox */
  name: string;
  base?: ComAtprotoRepoStrongRef.Main;
  /** The provider of the sandbox, e.g. 'daytona', 'vercel', 'cloudflare', etc. */
  provider?: string;
  description?: string;
  /** Any URI related to the sandbox */
  website?: string;
  /** URI to an image logo for the sandbox */
  logo?: string;
  topics?: string[];
  /** A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo. */
  repo?: string;
  /** A URI to a README for the sandbox. */
  readme?: string;
  /** Number of virtual CPUs allocated to the sandbox */
  vcpus?: number;
  /** Amount of memory in GB allocated to the sandbox */
  memory?: number;
  /** Amount of disk space in GB allocated to the sandbox */
  disk?: number;
  volumes?: string[];
  ports?: number[];
  secrets?: string[];
  envs?: string[];
  createdAt: string;
  [k: string]: unknown;
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    (v.$type === "io.pocketenv.sandbox#main" ||
      v.$type === "io.pocketenv.sandbox")
  );
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox#main", v);
}
