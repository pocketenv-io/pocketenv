import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema",
  dbCredentials: {
    url: Deno.env.get("POSTGRES_URL")!,
  },
});
