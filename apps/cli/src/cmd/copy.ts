import consola from "consola";
import ora from "ora";
import { c } from "../theme";

async function copy(source: string, destination: string) {
  const spinner = ora(
    `Copying sandbox from ${c.primary(source)} to ${c.primary(destination)}...`,
  ).start();

  setTimeout(() => {
    spinner.color = "yellow";
    spinner.text = "Loading rainbows";
    spinner.stopAndPersist({
      text: `Copied files from ${c.primary(source)} to ${c.primary(destination)}`,
    });
  }, 1000);
}

export default copy;
