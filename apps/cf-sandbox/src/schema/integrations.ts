import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";

const integrations = pgTable(
  "integrations",
  {
    id: text("id")
      .primaryKey()
      .default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id),
    name: text("name").notNull(),
    description: text("description"),
    webhookUrl: text("webhook_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_sandbox_integration").on(t.sandboxId, t.name)],
);

export type SelectIntegration = InferSelectModel<typeof integrations>;
export type InsertIntegration = InferInsertModel<typeof integrations>;

export default integrations;
