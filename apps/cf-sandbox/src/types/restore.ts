import { z } from "zod";

export const restoreSchema = z.object({
  backupId: z.string(),
});

export type RestoreParams = z.infer<typeof restoreSchema>;
