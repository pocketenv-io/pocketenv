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
    v.$type === "io.pocketenv.sandbox.defs#secret"
  );
}

export function validateSecret(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#secret", v);
}

export interface EnvVar {
  /** Name of the environment variable, e.g. 'NODE_ENV', 'PORT', etc. */
  name: string;
  /** Value of the environment variable. This will be visible in API responses and should not contain sensitive information. */
  value: string;
  [k: string]: unknown;
}

export function isEnvVar(v: unknown): v is EnvVar {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#envVar"
  );
}

export function validateEnvVar(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#envVar", v);
}

export type Secrets = Secret[];
export type Envs = EnvVar[];
