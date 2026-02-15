import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const volumes = pgTable("volumes", {
  id: text("id").primaryKey().default(sql`volume_id()`),
  slug: text("slug").unique().notNull(),
  size: integer("size").notNull(),
  sizeUnit: text("size_unit").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SelectVolume = InferSelectModel<typeof volumes>;
export type InsertVolume = InferInsertModel<typeof volumes>;

export default volumes;
