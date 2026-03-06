import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes.ts";
import files from "./files.ts";

const sandboxFiles = pgTable("sandbox_files", {
  id: text("id")
    .primaryKey()
    .default(sql`xata_id()`),
  sandboxId: text("sandbox_id")
    .notNull()
    .references(() => sandboxes.id),
  fileId: text("file_id")
    .notNull()
    .references(() => files.id),
  path: text("path").notNull(),
});

export type SelectSandboxFile = InferSelectModel<typeof sandboxFiles>;
export type InsertSandboxFile = InferInsertModel<typeof sandboxFiles>;

export default sandboxFiles;
