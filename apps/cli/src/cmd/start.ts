import consola from "consola";
import chalk from "chalk";
import getAccessToken from "../lib/getAccessToken";
import { client } from "../client";
import { env } from "../lib/env";
import connectToSandbox from "./ssh";

async function start(
  name: string,
  { ssh, repo }: { ssh?: boolean; repo?: string },
) {
  const token = await getAccessToken();

  try {
    await client.post(
      "/xrpc/io.pocketenv.sandbox.startSandbox",
      {
        repo,
      },
      {
        params: {
          id: name,
        },
        headers: {
          Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
        },
      },
    );

    if (ssh) {
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
