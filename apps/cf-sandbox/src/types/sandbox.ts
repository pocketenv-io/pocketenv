import * as R from "ramda";
import { z } from "zod";

const enforceUniqueNames = (items: Array<{ name: string }>) => {
  const duplicates = R.pipe(
    R.groupBy<{ name: string }, string>(R.prop("name")),
    R.filter((group: any) => group.length > 1),
    R.keys,
  )(items);

  if (duplicates.length > 0) {
    throw new Error(`Duplicate names found: ${duplicates.join(", ")}`);
  }

  return items;
};

export const SecretSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export type Secret = z.infer<typeof SecretSchema>;

export const VariableSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export const SandboxConfigSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  provider: z.enum(["cloudflare"]).optional().default("cloudflare"),
  base: z.enum(["openclaw"]).optional().default("openclaw"),
  keepAlive: z.boolean().optional().default(false),
  vcpus: z.number().int().positive().optional().default(2),
  memory: z.number().int().positive().optional().default(4),
  disk: z.number().int().positive().optional().default(8),
  sleepAfter: z
    .string()
    .regex(
      /^\d+(h|m|s)$/,
      "Invalid format. Use a number followed by 'h', 'm', or 's' (e.g., '1h', '30m', '15s').",
    )
    .optional(),
  variables: z
    .array(VariableSchema)
    .optional()
    .default([])
    .refine(
      (secrets) => {
        enforceUniqueNames(secrets);
        return true;
      },
      { message: "Duplicate secret names are not allowed." },
    ),
  secrets: z
    .array(SecretSchema)
    .optional()
    .default([])
    .refine(
      (secrets) => {
        enforceUniqueNames(secrets);
        return true;
      },
      { message: "Duplicate secret names are not allowed." },
    ),
});

export type SandboxConfig = z.infer<typeof SandboxConfigSchema>;
