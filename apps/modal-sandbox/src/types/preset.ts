import z from "zod";

export const PresetSchema = z.array(
  z.object({
    name: z.string().optional(),
    if: z.string().optional(),
    run: z.string(),
  }),
);

export type Preset = z.infer<typeof PresetSchema>;
