import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import users from "./users";

const modalAuth = pgTable(
  "modal_auth",
  {
    id: text("id").primaryKey().default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    tokenId: text("token_id").notNull(),
    redactedTokenId: text("redacted_token_id").notNull(),
    tokenSecret: text("token_secret").notNull(),
    redactedTokenSecret: text("redacted_token_secret").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_modal_auth").on(t.sandboxId, t.userId)],
);

export type SelectModalAuth = InferSelectModel<typeof modalAuth>;
export type InsertModalAuth = InferInsertModel<typeof modalAuth>;

export default modalAuth;
