import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import users from "./users.ts";

const sandboxes = pgTable("sandboxes", {
  id: text("id")
    .primaryKey()
    .default(sql`sandbox_id()`),
  base: text("base").notNull(),
  name: text("name").unique().notNull(),
  provider: text("provider").default("cloudflare").notNull(),
  description: text("description"),
  publicKey: text("public_key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  instanceType: text("instance_type").notNull(),
  status: text("status").notNull(),
  keepAlive: boolean("keep_alive").default(false).notNull(),
  sleepAfter: text("sleep_after"),
  sandbox_id: text("sandbox_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SelectSandbox = InferSelectModel<typeof sandboxes>;
export type InsertSandbox = InferInsertModel<typeof sandboxes>;

export default sandboxes;
