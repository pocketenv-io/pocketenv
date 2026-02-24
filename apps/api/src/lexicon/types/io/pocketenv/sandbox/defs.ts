/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";
import type * as IoPocketenvUserDefs from "../user/defs";

export interface SandboxViewBasic {
  /** Name of the sandbox */
  name?: string;
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
  ports?: number[];
  /** Number of times the sandbox has been installed by users. */
  installs?: number;
  createdAt?: string;
  [k: string]: unknown;
}

export function isSandboxViewBasic(v: unknown): v is SandboxViewBasic {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#sandboxViewBasic"
  );
}

export function validateSandboxViewBasic(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#sandboxViewBasic", v);
}

export interface SandboxViewDetailed {
  /** Name of the sandbox */
  name?: string;
  /** The provider of the sandbox, e.g. 'daytona', 'vercel', 'cloudflare', etc. */
  provider?: string;
  description?: string;
  /** The current status of the sandbox, e.g. 'RUNNING', 'STOPPED', etc. */
  status?: string;
  startedAt?: string;
  /** The sandbox timeout in seconds */
  timeout?: number;
  /** The base sandbox that this sandbox was created from, if any. This can be used to determine the template or configuration used to create the sandbox. */
  baseSandbox?: string;
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
  ports?: number[];
  /** Number of times the sandbox has been installed by users. */
  installs?: number;
  createdAt?: string;
  owner?: IoPocketenvUserDefs.UserViewBasic;
  [k: string]: unknown;
}

export function isSandboxViewDetailed(v: unknown): v is SandboxViewDetailed {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#sandboxViewDetailed"
  );
}

export function validateSandboxViewDetailed(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#sandboxViewDetailed", v);
}

export interface SandboxDetailsPref {
  /** The name of the sandbox */
  name?: string;
  /** A description for the sandbox */
  description?: string;
  /** A list of topics/tags to associate with the sandbox */
  topics?: string[];
  /** A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo. */
  repo?: string;
  /** The number of virtual CPUs to allocate for the sandbox */
  vcpus?: number;
  /** The amount of memory (in GB) to allocate for the sandbox */
  memory?: number;
  /** The amount of disk space (in GB) to allocate for the sandbox */
  disk?: number;
  /** A URI to a README for the sandbox. */
  readme?: string;
  [k: string]: unknown;
}

export function isSandboxDetailsPref(v: unknown): v is SandboxDetailsPref {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#sandboxDetailsPref"
  );
}

export function validateSandboxDetailsPref(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#sandboxDetailsPref", v);
}

export interface SecretPref {
  /** The name of the secret */
  name?: string;
  /** The value of the secret. This will be encrypted at rest and redacted in any API responses. */
  value?: string;
  [k: string]: unknown;
}

export function isSecretPref(v: unknown): v is SecretPref {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#secretPref"
  );
}

export function validateSecretPref(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#secretPref", v);
}

/** A variable to add to the sandbox */
export interface VariablePref {
  /** The name of the variable */
  name?: string;
  /** The value of the variable. This will be visible in API responses and should not contain sensitive information. */
  value?: string;
  [k: string]: unknown;
}

export function isVariablePref(v: unknown): v is VariablePref {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#variablePref"
  );
}

export function validateVariablePref(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#variablePref", v);
}

/** A file to add to the sandbox */
export interface FilePref {
  /** The name of the file */
  name?: string;
  /** The content of the file. */
  content?: string;
  /** Whether the file content should be encrypted at rest and redacted in API responses. This is useful for files that may contain sensitive information. */
  encrypt?: boolean;
  /** The path within the sandbox where the file will be created, e.g. '/app/config.json'. If not provided, the file will be created in the root directory of the sandbox. */
  path?: string;
  [k: string]: unknown;
}

export function isFilePref(v: unknown): v is FilePref {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#filePref"
  );
}

export function validateFilePref(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#filePref", v);
}

/** A volume to add to the sandbox */
export interface VolumePref {
  /** The name of the volume */
  name?: string;
  /** The mount path within the sandbox where the volume will be attached, e.g. '/data', '/logs', etc. */
  path?: string;
  /** Whether the volume should be mounted as read-only */
  readOnly?: boolean;
  [k: string]: unknown;
}

export function isVolumePref(v: unknown): v is VolumePref {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#volumePref"
  );
}

export function validateVolumePref(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#volumePref", v);
}

export type Preferences = (
  | SandboxDetailsPref
  | SecretPref
  | VariablePref
  | FilePref
  | VolumePref
  | { $type: string; [k: string]: unknown }
)[];
