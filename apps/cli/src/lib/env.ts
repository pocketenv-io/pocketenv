import { cleanEnv, str } from "envalid";

export const env = cleanEnv(process.env, {
  POCKETENV_TOKEN: str({ default: "" }),
  POCKETENV_API_URL: str({ default: "https://api.pocketenv.io" }),
  POCKETENV_CF_URL: str({ default: "https://sbx.pocketenv.io" }),
  POCKETENV_TTY_URL: str({ default: "https://api.pocketenv.io/tty" }),
  POCKETENV_PTY_URL: str({ default: "https://api.pocketenv.io/pty" }),
  POCKETENV_PUBLIC_KEY: str({
    default: "2bf96e12d109e6948046a7803ef1696e12c11f04f20a6ce64dbd4bcd93db9341",
  }),
});
