import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import chalk from "chalk";
import { client } from "../client";
import { env } from "../lib/env";
import consola from "consola";

async function whoami() {
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
      return;
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
    return;
  }

  const profile = await client.get("/xrpc/io.pocketenv.actor.getProfile", {
    headers: {
      Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
    },
  });
  const handle = `@${profile.data.handle}`;
  consola.log(
    `You are logged in as ${chalk.cyan(handle)} (${profile.data.displayName}).`,
  );
}

export default whoami;
