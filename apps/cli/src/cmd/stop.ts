import chalk from "chalk";
import consola from "consola";

async function stop(name: string) {
  consola.success(`Sandbox ${chalk.greenBright(name)} stopped`);
}

export default stop;
