import { PRIVATE_KEY_USAGE } from "@atproto/oauth-client-node";
import dotenv from "dotenv";
import { cleanEnv, host, port, str } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    default: "development",
    choices: ["development", "production", "test"],
  }),
  HOST: host({ default: "localhost" }),
  PORT: port({ default: 8789 }),
  PUBLIC_URL: str({ default: "http://localhost:8000" }),
  DB_PATH: str({ devDefault: ":memory:" }),
  KV_DB_PATH: str({ devDefault: ":memory:" }),
  COOKIE_SECRET: str({ devDefault: "00000000000000000000000000000000" }),
  FRONTEND_URL: str({ devDefault: "http://localhost:5173" }),
  JWT_SECRET: str({ devDefault: "00000000000000000000000000000000" }),
  POSTGRES_URL: str({}),
  REDIS_URL: str({ default: "redis://localhost:6379" }),
  POCKETENV_DID: str({}),
  PRIVATE_KEY_1: str({}),
  PRIVATE_KEY_2: str({}),
  PRIVATE_KEY_3: str({}),
  PUBLIC_KEY: str({}),
  PRIVATE_KEY: str({}),
});
