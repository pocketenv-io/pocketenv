import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core";
import sandboxes from "./sandboxes";
import services from "./services";

const sandboxPorts = pgTable(
  "sandbox_ports",
  {
    id: text("id").primaryKey().default(sql`xata_id()`),
    sandboxId: text("sandbox_id")
      .notNull()
      .references(() => sandboxes.id),
    exposedPort: integer("exposed_port").notNull(),
    previewUrl: text("preview_url"),
    description: text("description"),
    serviceId: text("service_id").references(() => services.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unique_sandbox_port").on(t.sandboxId, t.exposedPort)],
);

export type SelectSandboxPort = InferSelectModel<typeof sandboxPorts>;
export type InsertSandboxPort = InferInsertModel<typeof sandboxPorts>;

export default sandboxPorts;
