import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes.ts";

const sshKeys = pgTable(
  "ssh_keys",
  {
    id: text("id")
      .primaryKey()
      .default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id, { onDelete: "cascade" }),
    publicKey: text("public_key").notNull(),
    privateKey: text("private_key").notNull(),
    redacted: text("redacted").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_sandbox_ssh_key").on(t.publicKey, t.sandboxId)],
);

export type SelectSshKey = InferSelectModel<typeof sshKeys>;
export type InsertSshKey = InferInsertModel<typeof sshKeys>;

export default sshKeys;
