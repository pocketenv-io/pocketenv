import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes.ts";
import variables from "./variables.ts";

const sandboxVariables = pgTable(
  "sandbox_variables",
  {
    id: text("id")
      .primaryKey()
      .default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id),
    variableId: text("variable_id")
      .notNull()
      .references(() => variables.id),
  },
  (table) => ({
    uniqueSandboxSecret: uniqueIndex("unique_sandbox_variables").on(
      table.sandboxId,
      table.variableId,
    ),
  }),
);

export type SelectSandboxVariables = InferSelectModel<typeof sandboxVariables>;
export type InsertSandboxVariables = InferInsertModel<typeof sandboxVariables>;
export default sandboxVariables;
