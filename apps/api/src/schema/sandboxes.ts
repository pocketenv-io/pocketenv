import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import users from "./users";

const sandboxes = pgTable("sandboxes", {
  id: text("id").primaryKey().default(sql`sandbox_id()`),
  base: text("base"),
  name: text("name").unique().notNull(),
  displayName: text("display_name"),
  uri: text("uri").unique(),
  cid: text("cid").unique(),
  repo: text("repo"),
  provider: text("provider").default("cloudflare").notNull(),
  description: text("description"),
  logo: text("logo"),
  publicKey: text("public_key").notNull(),
  readme: text("readme"),
  userId: text("user_id").references(() => users.id),
  instanceType: text("instance_type"),
  vcpus: integer("vcpus"),
  memory: integer("memory"),
  disk: integer("disk"),
  status: text("status").notNull(),
  keepAlive: boolean("keep_alive").default(false).notNull(),
  sleepAfter: text("sleep_after"),
  sandbox_id: text("sandbox_id"),
  installs: integer("installs").default(0).notNull(),
  startedAt: timestamp("started_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SelectSandbox = InferSelectModel<typeof sandboxes>;
export type InsertSandbox = InferInsertModel<typeof sandboxes>;

export default sandboxes;
