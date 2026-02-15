import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./src/lib/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema",
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
});
