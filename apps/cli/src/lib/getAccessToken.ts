import consola from "consola";
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { env } from "process";

async function getAccessToken(): Promise<string> {
  const tokenPath = path.join(os.homedir(), ".pocketenv", "token.json");
  try {
    await fs.access(tokenPath);
  } catch (err) {
    if (!env.POCKETENV_TOKEN) {
      consola.error(
        `You are not logged in. Please run ${chalk.greenBright(
          "`pocketenv login <username>.bsky.social`",
        )} first.`,
      );
      process.exit(1);
    }
  }

  const tokenData = await fs.readFile(tokenPath, "utf-8");
  const { token } = JSON.parse(tokenData);
  if (!token) {
    consola.error(
      `You are not logged in. Please run ${chalk.greenBright(
        "`rocksky login <username>.bsky.social`",
      )} first.`,
    );
    process.exit(1);
  }
  return token;
}

export default getAccessToken;
