import { z } from "zod";

export const pullSchema = z.object({
  uuid: z.string(),
  directoryPath: z.string(),
});

export type PullDirectoryParams = z.infer<typeof pullSchema>;
