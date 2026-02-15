import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const snapshots = pgTable("snapshots", {
  id: text("id").primaryKey().default(sql`snapshot_id()`),
  slug: text("slug").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectSnapshot = InferSelectModel<typeof snapshots>;
export type InsertSnapshot = InferInsertModel<typeof snapshots>;

export default snapshots;
