import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes.ts";
import volumes from "./volumes.ts";

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
    name: text("name"),
    path: text("path").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_sandbox_volume_path").on(t.sandboxId, t.path)],
);

export type SelectSandboxVolume = InferSelectModel<typeof sandboxVolumes>;
export type InsertSandboxVolume = InferInsertModel<typeof sandboxVolumes>;

export default sandboxVolumes;
