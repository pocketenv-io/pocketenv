import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import volumes from "./volumes";

const sandboxVolumes = pgTable(
  "sandbox_volumes",
  {
    id: text("id")
      .primaryKey()
      .default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id),
    volumeId: text("volume_id")
      .notNull()
      .references(() => volumes.id),
    path: text("path").notNull(),
  },
  (t) => [
    uniqueIndex("unique_sandbox_volume").on(t.sandboxId, t.volumeId),
    uniqueIndex("unique_sandbox_volume_path").on(t.sandboxId, t.path),
  ],
);

export type SelectSandboxVolume = InferSelectModel<typeof sandboxVolumes>;
export type InsertSandboxVolume = InferInsertModel<typeof sandboxVolumes>;

export default sandboxVolumes;
