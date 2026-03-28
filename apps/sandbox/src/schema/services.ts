import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes.ts";

const services = pgTable(
  "services",
  {
    id: text("id")
      .primaryKey()
      .default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id),
    name: text("name").notNull(),
    command: text("command").notNull(),
    description: text("description"),
    serviceId: text("service_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_sandbox_service").on(t.name, t.sandboxId)],
);

export type SelectService = InferSelectModel<typeof services>;
export type InsertService = InferInsertModel<typeof services>;

export default services;
