import consola from "consola";
import chalk from "chalk";

async function start(name: string) {
  consola.success(`Sandbox ${chalk.greenBright(name)} started`);
  consola.log(
    `Run ${chalk.greenBright(`pocketenv console ${name}`)} to access the sandbox`,
  );
}

export default start;
