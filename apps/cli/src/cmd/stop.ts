import chalk from "chalk";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { configureSdk } from "../lib/sdk";

async function stop(name: string) {
  await configureSdk();

  try {
    const sandbox = await Sandbox.get(name);
    await sandbox.stop();
    consola.success(`Sandbox ${chalk.greenBright(name)} stopped`);
  } catch {
    consola.error("Failed to stop sandbox");
  }
}

export default stop;
