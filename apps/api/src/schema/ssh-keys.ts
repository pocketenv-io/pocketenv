import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";

const sshKeys = pgTable("ssh_keys", {
  id: text("id")
    .primaryKey()
    .default(sql`xata_id()`),
  sandboxId: text("sandbox_id").references(() => sandboxes.id),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  redacted: text("redacted").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectSshKey = InferSelectModel<typeof sshKeys>;
export type InsertSshKey = InferInsertModel<typeof sshKeys>;

export default sshKeys;
