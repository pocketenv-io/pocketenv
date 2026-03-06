import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes.ts";

const authorizedKeys = pgTable("authorized_keys", {
  id: text("id")
    .primaryKey()
    .default(sql`xata_id()`),
  sandboxId: text("sandbox_id").references(() => sandboxes.id),
  publicKey: text("public_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectAuthorizedKey = InferSelectModel<typeof authorizedKeys>;
export type InsertAuthorizedKey = InferInsertModel<typeof authorizedKeys>;

export default authorizedKeys;
