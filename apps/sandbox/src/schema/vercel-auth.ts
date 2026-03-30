import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes.ts";
import users from "./users.ts";

const vercelAuth = pgTable(
  "vercel_auth",
  {
    id: text("id")
      .primaryKey()
      .default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    vercelToken: text("vercel_token").notNull(),
    redactedVercelToken: text("redacted_vercel_token").notNull(),
    projectId: text("project_id").notNull(),
    teamId: text("team_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_vercel_auth").on(t.sandboxId, t.userId)],
);

export type SelectVercelAuth = InferSelectModel<typeof vercelAuth>;
export type InsertVercelAuth = InferInsertModel<typeof vercelAuth>;

export default vercelAuth;
