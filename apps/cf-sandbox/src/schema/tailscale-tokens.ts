import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";

const tailscaleTokens = pgTable("tailscale_tokens", {
  id: text("id")
    .primaryKey()
    .default(sql`xata_id()`),
  sandboxId: text("sandbox_id").references(() => sandboxes.id),
  tokens: text("tokens").notNull(),
  redacted: text("redacted").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectTailscaleToken = InferSelectModel<typeof tailscaleTokens>;
export type InsertTailscaleToken = InferInsertModel<typeof tailscaleTokens>;

export default tailscaleTokens;
