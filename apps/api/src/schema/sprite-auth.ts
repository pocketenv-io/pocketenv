import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import users from "./users";

const spriteAuth = pgTable(
  "sprite_auth",
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
    spriteToken: text("sprite_token").notNull(),
    redactedSpriteToken: text("redacted_sprite_token").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_sprite_auth").on(t.sandboxId, t.userId)],
);

export type SelectSpriteAuth = InferSelectModel<typeof spriteAuth>;
export type InsertSpriteAuth = InferInsertModel<typeof spriteAuth>;

export default spriteAuth;
