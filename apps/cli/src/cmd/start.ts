import consola from "consola";
import chalk from "chalk";
import getAccessToken from "../lib/getAccessToken";
import { client } from "../client";
import { env } from "../lib/env";

async function start(name: string) {
  const token = await getAccessToken();

  try {
    await client.post("/xrpc/io.pocketenv.sandbox.startSandbox", undefined, {
      params: {
        id: name,
      },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });

    consola.success(`Sandbox ${chalk.greenBright(name)} started`);
    consola.log(
      `Run ${chalk.greenBright(`pocketenv console ${name}`)} to access the sandbox`,
    );
  } catch {
    consola.error("Failed to start sandbox");
  }
}

export default start;
