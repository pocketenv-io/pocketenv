import { cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
  POCKETENV_TOKEN: str({ default: "" }),
  POCKETENV_API_URL: str({ default: "https://api.pocketenv.io" }),
  POCKETENV_CF_URL: str({ default: "https://sbx.pocketenv.io" }),
  POCKETENV_TTY_URL: str({ default: "https://api.pocketenv.io" }),
});
