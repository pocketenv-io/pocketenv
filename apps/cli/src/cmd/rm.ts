import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { configureSdk } from "../lib/sdk";

async function deleteSandbox(id: string) {
  await configureSdk();
  try {
    const sandbox = await Sandbox.get(id);
    await sandbox.delete();
    consola.success("Sandbox deleted successfully");
  } catch {
    consola.error("Failed to delete sandbox");
  }
}

export default deleteSandbox;
