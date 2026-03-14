import { cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
  POCKETENV_TOKEN: str({ default: "" }),
  POCKETENV_API_URL: str({ default: "https://api.pocketenv.io" }),
});
