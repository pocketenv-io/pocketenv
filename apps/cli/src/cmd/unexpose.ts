import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../lib/getAccessToken";

export async function unexposePort(sandbox: string, port: number) {
  const token = await getAccessToken();

  consola.success(
    `Port ${chalk.rgb(0, 232, 198)(port)} unexposed for sandbox ${chalk.rgb(0, 232, 198)(sandbox)}`,
  );
}
