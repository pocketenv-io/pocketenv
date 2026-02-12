import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export function getConnection() {
  const pool = new pg.Pool({
    connectionString: process.env.POSTGRES_URL,
    max: 20,
  });
  return drizzle(pool);
}
