import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../lib/getAccessToken";

export async function putFile(sandbox: string, path: string) {
  const token = await getAccessToken();

  consola.success(
    `File ${chalk.rgb(0, 232, 198)(path)} successfully created in sandbox ${chalk.rgb(0, 232, 198)(sandbox)}`,
  );
}

export async function listFiles(sandbox: string) {
  const token = await getAccessToken();
}

export async function deleteFile(sandbox: string, id: string) {
  const token = await getAccessToken();

  consola.success(
    `File ${chalk.rgb(0, 232, 198)(id)} successfully deleted from sandbox ${chalk.rgb(0, 232, 198)(sandbox)}`,
  );
}
