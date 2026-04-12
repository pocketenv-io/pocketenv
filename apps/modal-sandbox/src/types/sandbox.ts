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

export const SandboxConfigSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    provider: z
      .enum([
        "daytona",
        "vercel",
        "deno",
        "sprites",
        "modal",
        "e2b",
        "hopx",
        "runloop",
        "blaxel",
      ])
      .optional()
      .default("deno"),
    base: z.enum(["openclaw"]).optional().default("openclaw"),
    keepAlive: z.boolean().optional().default(false),
    spriteToken: z.string().optional(),
    redactedSpriteToken: z.string().optional(),
    daytonaOrganizationId: z.string().optional(),
    denoDeployToken: z.string().optional(),
    redactedDenoDeployToken: z.string().optional(),
    redactedDaytonaApiKey: z.string().optional(),
    daytonaApiKey: z.string().optional(),
    vercelApiToken: z.string().optional(),
    redactedVercelApiToken: z.string().optional(),
    vercelProjectId: z.string().optional(),
    vercelTeamId: z.string().optional(),
    modalTokenId: z.string().optional(),
    redactedModalTokenId: z.string().optional(),
    modalTokenSecret: z.string().optional(),
    redactedModalTokenSecret: z.string().optional(),
    e2bApiKey: z.string().optional(),
    redactedE2bApiKey: z.string().optional(),
    hopxApiKey: z.string().optional(),
    redactedHopxApiKey: z.string().optional(),
    runloopApiKey: z.string().optional(),
    redactedRunloopApiKey: z.string().optional(),
    vcpus: z.number().optional().default(2),
    memory: z.number().optional().default(4),
    disk: z.number().optional().default(3),
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
  })
  .superRefine((data, ctx) => {
    if (data.provider === "sprites") {
      if (!data.spriteToken) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "spriteToken is required when provider is 'sprites'",
          path: ["spriteToken"],
        });
      }
      if (!data.redactedSpriteToken) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "redactedSpriteToken is required when provider is 'sprites'",
          path: ["redactedSpriteToken"],
        });
      }
    }

    if (data.provider === "daytona") {
      if (!data.daytonaApiKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "daytonaApiKey is required when provider is 'daytona'",
          path: ["daytonaApiKey"],
        });
      }
      if (!data.redactedDaytonaApiKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "redactedDaytonaApiKey is required when provider is 'daytona'",
          path: ["redactedDaytonaApiKey"],
        });
      }
      if (!data.daytonaOrganizationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "daytonaOrganizationId is required when provider is 'daytona'",
          path: ["daytonaOrganizationId"],
        });
      }
    }

    if (data.provider === "deno") {
      if (!data.denoDeployToken) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "denoDeployToken is required when provider is 'deno'",
          path: ["denoDeployToken"],
        });
      }
      if (!data.redactedDenoDeployToken) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "redactedDenoDeployToken is required when provider is 'deno'",
          path: ["redactedDenoDeployToken"],
        });
      }
    }

    if (data.provider === "vercel") {
      if (!data.vercelApiToken) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "vercelApiKey is required when provider is 'vercel'",
          path: ["vercelApiKey"],
        });
      }
      if (!data.redactedVercelApiToken) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "redactedVercelApiKey is required when provider is 'vercel'",
          path: ["redactedVercelApiKey"],
        });
      }
      if (!data.vercelProjectId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "vercelProjectId is required when provider is 'vercel'",
          path: ["vercelProjectId"],
        });
      }
    }

    if (data.provider === "modal") {
      if (!data.modalTokenId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "modalTokenId is required when provider is 'modal'",
          path: ["modalTokenId"],
        });
      }
      if (!data.redactedModalTokenId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "redactedModalTokenId is required when provider is 'modal'",
          path: ["redactedModalTokenId"],
        });
      }
      if (!data.modalTokenSecret) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "modalTokenSecret is required when provider is 'modal'",
          path: ["modalTokenSecret"],
        });
      }
      if (!data.redactedModalTokenSecret) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "redactedModalTokenSecret is required when provider is 'modal'",
          path: ["redactedModalTokenSecret"],
        });
      }
    }

    if (data.provider === "e2b") {
      if (!data.e2bApiKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "e2bApiKey is required when provider is 'e2b'",
          path: ["e2bApiKey"],
        });
      }
      if (!data.redactedE2bApiKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "redactedE2bApiKey is required when provider is 'e2b'",
          path: ["redactedE2bApiKey"],
        });
      }
    }

    if (data.provider === "hopx") {
      if (!data.hopxApiKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "hopxApiKey is required when provider is 'hopx'",
          path: ["hopxApiKey"],
        });
      }
      if (!data.redactedHopxApiKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "redactedHopxApiKey is required when provider is 'hopx'",
          path: ["redactedHopxApiKey"],
        });
      }
    }

    if (data.provider === "runloop") {
      if (!data.runloopApiKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "runloopApiKey is required when provider is 'runloop'",
          path: ["runloopApiKey"],
        });
      }
      if (!data.redactedRunloopApiKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "redactedRunloopApiKey is required when provider is 'runloop'",
          path: ["redactedRunloopApiKey"],
        });
      }
    }
  });

export const StartSandboxInputSchema = z.object({
  repo: z.string().optional(),
});

export type SandboxConfig = z.infer<typeof SandboxConfigSchema>;

export type StartSandboxInput = z.infer<typeof StartSandboxInputSchema>;
