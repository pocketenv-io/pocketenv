import chalk from "chalk";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { configureSdk } from "../lib/sdk";

async function whoami() {
  await configureSdk();
  const profile = await Sandbox.getProfile();
  const handle = `@${profile.handle}`;
  consola.log(
    `You are logged in as ${chalk.cyan(handle)} (${profile.displayName}).`,
  );
}

export default whoami;
