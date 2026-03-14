import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../lib/getAccessToken";
import { client } from "../client";
import { env } from "../lib/env";

async function stop(name: string) {
  const token = await getAccessToken();

  await client.post("/xrpc/io.pocketenv.sandbox.stopSandbox", undefined, {
    params: {
      id: name,
    },
    headers: {
      Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
    },
  });

  consola.success(`Sandbox ${chalk.greenBright(name)} stopped`);
}

export default stop;
