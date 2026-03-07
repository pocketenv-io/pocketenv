import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes.ts";
import secrets from "./secrets.ts";

const sandboxSecrets = pgTable(
  "sandbox_secrets",
  {
    id: text("id")
      .primaryKey()
      .default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id),
    secretId: text("secret_id")
      .notNull()
      .references(() => secrets.id),
    name: text("name"),
  },
  (t) => [
    uniqueIndex("unique_sandbox_secret").on(t.sandboxId, t.secretId),
    uniqueIndex("unique_sandbox_secret_by_name").on(t.sandboxId, t.name),
  ],
);

export type SelectSandboxSecret = InferSelectModel<typeof sandboxSecrets>;
export type InsertSandboxSecret = InferInsertModel<typeof sandboxSecrets>;

export default sandboxSecrets;
