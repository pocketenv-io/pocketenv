import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import variables from "./variables";

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
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("unique_sandbox_variables").on(t.sandboxId, t.variableId),
    uniqueIndex("unique_sandbox_variables_by_name").on(t.sandboxId, t.name),
  ],
);

export type SelectSandboxVariable = InferSelectModel<typeof sandboxVariables>;
export type InsertSandboxVariable = InferInsertModel<typeof sandboxVariables>;
export default sandboxVariables;
