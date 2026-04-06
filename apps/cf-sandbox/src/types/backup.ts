import { z } from "zod";

export const pullSchema = z.object({
  directory: z.string(),
  description: z.string().optional(),
  ttl: z.number().positive().optional(),
});

export type BackupParams = z.infer<typeof pullSchema>;
