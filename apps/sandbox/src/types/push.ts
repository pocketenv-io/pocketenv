import { z } from "zod";

export const pushSchema = z.object({
  directoryPath: z.string(),
});

export type PushDirectoryParams = z.infer<typeof pushSchema>;
