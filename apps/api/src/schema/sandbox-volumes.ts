import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import volumes from "./volumes";

const sandboxVolumes = pgTable("sandbox_volumes", {
  id: text("id")
    .primaryKey()
    .default(sql`xata_id()`),
  sandboxId: text("sandbox_id")
    .notNull()
    .references(() => sandboxes.id),
  volumeId: text("volume_id")
    .notNull()
    .references(() => volumes.id),
});

export type SelectSandboxVolumes = InferSelectModel<typeof sandboxVolumes>;
export type InsertSandboxVolumes = InferInsertModel<typeof sandboxVolumes>;

export default sandboxVolumes;
