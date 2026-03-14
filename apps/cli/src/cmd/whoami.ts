import chalk from "chalk";
import { client } from "../client";
import { env } from "../lib/env";
import consola from "consola";
import getAccessToken from "../lib/getAccessToken";
import type { Profile } from "../types/profile";

async function whoami() {
  const token = await getAccessToken();
  const profile = await client.get<Profile>(
    "/xrpc/io.pocketenv.actor.getProfile",
    {
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );
  const handle = `@${profile.data.handle}`;
  consola.log(
    `You are logged in as ${chalk.cyan(handle)} (${profile.data.displayName}).`,
  );
}

export default whoami;
