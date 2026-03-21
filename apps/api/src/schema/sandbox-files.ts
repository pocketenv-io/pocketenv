import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import files from "./files";

const sandboxFiles = pgTable(
  "sandbox_files",
  {
    id: text("id").primaryKey().default(sql`file_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id),
    fileId: text("file_id")
      .notNull()
      .references(() => files.id),
    path: text("path").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_sandbox_file_path").on(t.sandboxId, t.path)],
);

export type SelectSandboxFile = InferSelectModel<typeof sandboxFiles>;
export type InsertSandboxFile = InferInsertModel<typeof sandboxFiles>;

export default sandboxFiles;
