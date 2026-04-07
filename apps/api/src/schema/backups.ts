import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";

const backups = pgTable("backups", {
  id: text("id").primaryKey().default(sql`xata_id()`),
  sandboxId: text("sandbox_id")
    .notNull()
    .references(() => sandboxes.id, { onDelete: "cascade" }),
  backupId: text("backup_id").notNull(),
  directory: text("directory").notNull(),
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectBackup = InferSelectModel<typeof backups>;
export type InsertBackup = InferInsertModel<typeof backups>;

export default backups;
