import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const variables = pgTable("variables", {
  id: text("id").primaryKey().default(sql`variable_id()`),
  name: text("name").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SelectVariable = InferSelectModel<typeof variables>;
export type InsertVariable = InferInsertModel<typeof variables>;

export default variables;
