import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export function getConnection() {
  const pool = new pg.Pool({
    connectionString:
      process.env.CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE ||
      env.HYPERDRIVE.connectionString,
    max: 20,
  });
  return drizzle(pool);
}
