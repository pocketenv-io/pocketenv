import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { configureSdk } from "../lib/sdk";

export async function exec(sandboxName: string, command: string[]) {
  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxName);
    const [cmd, ...args] = command;
    const result = await sandbox.exec(`${cmd} ${args.join(" ")}`);

    if (result.stdout) {
      process.stdout.write(
        result.stdout.endsWith("\n") ? result.stdout : result.stdout + "\n",
      );
    }
    if (result.stderr) {
      process.stderr.write(
        result.stderr.endsWith("\n") ? result.stderr : result.stderr + "\n",
      );
    }

    if (result.exitCode !== 0) {
      consola.error(`Command exited with code ${result.exitCode}`);
    }

    process.exit(result.exitCode);
  } catch (error) {
    consola.error("Failed to execute command:", error);
  }
}
