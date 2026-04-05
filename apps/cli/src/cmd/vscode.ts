import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { c } from "../theme";
import { configureSdk } from "../lib/sdk";

export async function exposeVscode(sandboxName: string) {
  await configureSdk();
  try {
    const sandbox = await Sandbox.get(sandboxName);
    await sandbox.vscode();
    consola.success(`VS Code Server exposed for sandbox ${c.primary(sandboxName)}`);
  } catch (error) {
    consola.error("Failed to expose VS Code:", error);
    process.exit(1);
  }
}
