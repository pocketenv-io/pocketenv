import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

const secrets = pgTable("secrets", {
  id: text("id").primaryKey().default(sql`secret_id()`),
  name: text("name").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SelectSecret = InferSelectModel<typeof secrets>;
export type InsertSecret = InferInsertModel<typeof secrets>;

export default secrets;
