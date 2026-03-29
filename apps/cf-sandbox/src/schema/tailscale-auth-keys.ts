import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";

const tailscaleAuthKey = pgTable("tailscale_auth_keys", {
  id: text("id")
    .primaryKey()
    .default(sql`xata_id()`),
  sandboxId: text("sandbox_id")
    .notNull()
    .references(() => sandboxes.id, { onDelete: "cascade" }),
  authKey: text("auth_key").notNull(),
  redacted: text("redacted").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectTailscaleAuthKey = InferSelectModel<typeof tailscaleAuthKey>;
export type InsertTailscaleAuthKey = InferInsertModel<typeof tailscaleAuthKey>;

export default tailscaleAuthKey;
