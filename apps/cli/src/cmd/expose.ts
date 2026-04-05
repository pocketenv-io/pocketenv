import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { c } from "../theme";
import { configureSdk } from "../lib/sdk";

export async function exposePort(
  sandboxName: string,
  port: number,
  description?: string,
) {
  await configureSdk();
  try {
    const sandbox = await Sandbox.get(sandboxName);
    const result = await sandbox.expose(port, description);

    consola.success(
      `Port ${c.primary(port)} exposed for sandbox ${c.primary(sandboxName)}`,
    );

    if (result.previewUrl) {
      consola.success(`Preview URL: ${c.secondary(result.previewUrl)}`);
    }
  } catch (error) {
    consola.error("Failed to expose port:", error);
    process.exit(1);
  }
}
