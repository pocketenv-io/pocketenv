import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import users from "./users";

const daytonaAuth = pgTable(
  "daytona_auth",
  {
    id: text("id").primaryKey().default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    apiKey: text("api_key").notNull(),
    redactedApiKey: text("redacted_api_key").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_daytona_auth").on(t.sandboxId, t.userId)],
);

export type SelectDaytonaAuth = InferSelectModel<typeof daytonaAuth>;
export type InsertDaytonaAuth = InferInsertModel<typeof daytonaAuth>;

export default daytonaAuth;
