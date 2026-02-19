import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import secrets from "./secrets";

const sandboxSecrets = pgTable(
  "sandbox_secrets",
  {
    id: text("id").primaryKey().default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id),
    secretId: text("secret_id")
      .notNull()
      .references(() => secrets.id),
  },
  (t) => [uniqueIndex("unique_sandbox_secret").on(t.sandboxId, t.secretId)],
);

export type SelectSandboxSecrets = InferSelectModel<typeof sandboxSecrets>;
export type InsertSandboxSecrets = InferInsertModel<typeof sandboxSecrets>;

export default sandboxSecrets;
