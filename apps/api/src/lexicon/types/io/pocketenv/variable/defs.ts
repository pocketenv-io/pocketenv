/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";

export interface VariableView {
  /** Unique identifier of the environment variable. */
  id?: string;
  /** Name of the environment variable, e.g. 'NODE_ENV', 'PORT', etc. */
  name?: string;
  /** Value of the environment variable. This will be visible in API responses and should not contain sensitive information. */
  value?: string;
  [k: string]: unknown;
}

export function isVariableView(v: unknown): v is VariableView {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.variable.defs#variableView"
  );
}

export function validateVariableView(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.variable.defs#variableView", v);
}

export interface Variable {
  /** Name of the environment variable, e.g. 'NODE_ENV', 'PORT', etc. */
  name: string;
  /** Value of the environment variable. This will be visible in API responses and should not contain sensitive information. */
  value: string;
  [k: string]: unknown;
}

export function isVariable(v: unknown): v is Variable {
  return (
    isObj(v) &&
    hasProp(v, "$type") &&
    v.$type === "io.pocketenv.variable.defs#variable"
  );
}

export function validateVariable(v: unknown): ValidationResult {
  return lexicons.validate("io.pocketenv.variable.defs#variable", v);
}

export type Variables = EnvVar[];
