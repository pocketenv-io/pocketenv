import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import users from "./users";

const denoAuth = pgTable(
  "deno_auth",
  {
    id: text("id")
      .primaryKey()
      .default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id, { onDelete: "cascade" }),
    deployToken: text("deploy_token").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    redactedDenoToken: text("redacted_deno_token").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_deno_auth").on(t.sandboxId, t.userId)],
);

export type SelectDenoAuth = InferSelectModel<typeof denoAuth>;
export type InsertDenoAuth = InferInsertModel<typeof denoAuth>;

export default denoAuth;
