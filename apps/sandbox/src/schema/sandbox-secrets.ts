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
  },
  (table) => ({
    uniqueSandboxSecret: uniqueIndex("unique_sandbox_secret").on(
      table.sandboxId,
      table.secretId,
    ),
  }),
);

export type SelectSandboxSecrets = InferSelectModel<typeof sandboxSecrets>;
export type InsertSandboxSecrets = InferInsertModel<typeof sandboxSecrets>;

export default sandboxSecrets;
