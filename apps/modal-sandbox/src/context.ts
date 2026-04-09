import { getConnection } from "./drizzle";

export type Context = {
  db: ReturnType<typeof getConnection>;
  did?: string;
};
