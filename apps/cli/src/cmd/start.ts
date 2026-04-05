import consola from "consola";
import chalk from "chalk";
import { Sandbox } from "@pocketenv/sdk";
import connectToSandbox from "./ssh";
import { expandRepo } from "../lib/expandRepo";
import { configureSdk } from "../lib/sdk";

async function start(
  name: string,
  {
    ssh,
    repo,
    keepAlive,
  }: { ssh?: boolean; repo?: string; keepAlive?: boolean },
) {
  await configureSdk();
  if (repo) repo = expandRepo(repo);

  try {
    const sandbox = await Sandbox.get(name);
    await sandbox.start({ repo, keepAlive });

    if (ssh) {
      await sandbox.waitUntilRunning();
      await connectToSandbox(name);
      return;
    }

    consola.success(`Sandbox ${chalk.greenBright(name)} started`);
    consola.log(
      `Run ${chalk.greenBright(`pocketenv console ${name}`)} to access the sandbox`,
    );
  } catch {
    consola.error("Failed to start sandbox");
  }
}

export default start;
