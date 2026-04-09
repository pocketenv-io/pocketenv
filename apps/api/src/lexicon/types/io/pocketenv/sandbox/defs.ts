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
  description?: string | null;
  /** A list of topics/tags to associate with the sandbox */
  topics?: (string | null)[];
  /** A git repository URL to clone into the sandbox, e.g. a GitHub/Tangled repo. */
  repo?: string | null;
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

export interface SandboxProviderPref {
  /** The name of the sandbox provider */
  name: string;
  /** The encrypted API key used to authenticate with the sandbox provider. */
  apiKey?: string;
  /** The redacted API key for the sandbox provider, returned in API responses. */
  redactedApiKey?: string;
  /** The ID of the organization in the sandbox provider, if applicable. This can be used to associate the sandbox with a specific organization or team within the provider's platform. */
  organizationId?: string;
  /** The project ID for Vercel, if the sandbox provider is Vercel. This is used to determine which Vercel project the sandbox should be created in. */
  vercelProjectId?: string;
  /** The team ID for Vercel, if the sandbox provider is Vercel and the sandbox should be created within a specific team. This is used to determine which team within the Vercel project the sandbox should be associated with. */
  vercelTeamId?: string;
  /** The token ID for Modal, if the sandbox provider is Modal. This is used to determine which Modal token to use when creating the sandbox. */
  modalTokenId?: string;
  /** The token secret for Modal, if the sandbox provider is Modal. This is used to determine which Modal token secret to use when creating the sandbox. */
  modalTokenSecret?: string;
  /** The redacted token ID for Modal, returned in API responses when the sandbox provider is Modal. This can be used to identify which Modal token is being used without exposing the actual token ID. */
  redactedModalTokenId?: string;
  /** The redacted token secret for Modal, returned in API responses when the sandbox provider is Modal. This can be used to identify which Modal token secret is being used without exposing the actual token secret. */
  redactedModalTokenSecret?: string;
  [k: string]: unknown;
}

export function isSandboxProviderPref(v: unknown): v is SandboxProviderPref {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#sandboxProviderPref"
  );
}

export function validateSandboxProviderPref(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#sandboxProviderPref", v);
}

export type Preferences = (
  | SandboxDetailsPref
  | SecretPref
  | VariablePref
  | FilePref
  | VolumePref
  | SandboxProviderPref
  | { $type: string; [k: string]: unknown }
)[];

export interface SshKeysView {
  /** Unique identifier of the SSH key. */
  id?: string;
  /** The public SSH key. */
  publicKey?: string;
  /** The private SSH key (redacted in API responses) */
  privateKey?: string;
  /** The timestamp when the SSH key was created. */
  createdAt?: string;
  /** The timestamp when the SSH key was last updated. */
  updatedAt?: string;
  [k: string]: unknown;
}

export function isSshKeysView(v: unknown): v is SshKeysView {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#sshKeysView"
  );
}

export function validateSshKeysView(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#sshKeysView", v);
}

export interface TailscaleAuthKeyView {
  /** Unique identifier of the Tailscale Auth Key. */
  id?: string;
  /** The Tailscale auth key (redacted in API responses) */
  authKey?: string;
  /** The redacted Auth Key. */
  redacted?: string;
  /** The timestamp when the Tailscale Auth Key was created. */
  createdAt?: string;
  /** The timestamp when the Tailscale Auth Key was last updated. */
  updatedAt?: string;
  [k: string]: unknown;
}

export function isTailscaleAuthKeyView(v: unknown): v is TailscaleAuthKeyView {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#tailscaleAuthKeyView"
  );
}

export function validateTailscaleAuthKeyView(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#tailscaleAuthKeyView", v);
}

export interface IntegrationView {
  /** Unique identifier of the integration. */
  id?: string;
  /** The name of the integration, e.g. 'GitHub', 'Slack', 'Trello', etc. */
  name?: string;
  /** The webhook URL of the integration. */
  webhookUrl?: string;
  /** The timestamp when the integration was created. */
  createdAt?: string;
  /** The timestamp when the integration was last updated. */
  updatedAt?: string;
  [k: string]: unknown;
}

export function isIntegrationView(v: unknown): v is IntegrationView {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#integrationView"
  );
}

export function validateIntegrationView(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#integrationView", v);
}

export type IntegrationsView = IntegrationView[];

export interface BackupViewBasic {
  /** Unique identifier of the backup. */
  id?: string;
  /** The directory that was backed up. */
  directory?: string;
  /** An optional description for the backup. */
  description?: string;
  /** Datetime when the backup will expire and be automatically deleted. */
  expiresAt?: number;
  /** datetime when the backup was created. */
  createdAt?: string;
  [k: string]: unknown;
}

export function isBackupViewBasic(v: unknown): v is BackupViewBasic {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.sandbox.defs#backupViewBasic"
  );
}

export function validateBackupViewBasic(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.sandbox.defs#backupViewBasic", v);
}
