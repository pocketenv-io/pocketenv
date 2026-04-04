import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

const sandboxCp = pgTable("sandbox_cp", {
  id: text("id").primaryKey().default(sql`xata_id()`),
  copyUuid: text("copy_uuid").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectSandboxCp = InferSelectModel<typeof sandboxCp>;
export type InsertSandboxCp = InferInsertModel<typeof sandboxCp>;

export default sandboxCp;
