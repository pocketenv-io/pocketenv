import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { c } from "../theme";
import { configureSdk } from "../lib/sdk";

export async function unexposePort(sandboxName: string, port: number) {
  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxName);
    await sandbox.unexpose(port);

    consola.success(
      `Port ${c.primary(port)} unexposed for sandbox ${c.primary(sandboxName)}`,
    );
  } catch (error) {
    consola.error(`Failed to unexpose port: ${error}`);
    process.exit(1);
  }
}
