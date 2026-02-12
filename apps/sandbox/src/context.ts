import { getConnection } from "./drizzle.ts";

export type Context = {
  db: ReturnType<typeof getConnection>;
};
