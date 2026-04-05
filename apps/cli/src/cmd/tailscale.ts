import { password } from "@inquirer/prompts";
import { Sandbox } from "@pocketenv/sdk";
import consola from "consola";
import { c } from "../theme";
import { configureSdk } from "../lib/sdk";

export async function putAuthKey(sandboxName: string) {
  const authKey = (
    await password({ message: "Enter Tailscale Auth Key" })
  ).trim();

  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxName);
    await sandbox.tailscale.setAuthKey(authKey);
    consola.success(
      `Tailscale auth key saved for sandbox: ${c.primary(sandboxName)}`,
    );
  } catch (error) {
    consola.error(`Failed to save Tailscale auth key: ${error}`);
    process.exit(1);
  }
}

export async function getTailscaleAuthKey(sandboxName: string) {
  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxName);
    const tailscale = await sandbox.tailscale.getAuthKey();
    consola.info(`Tailscale auth key: ${c.primary(tailscale.authKey ?? "")}`);
  } catch {
    consola.error(
      `No Tailscale Auth Key found for sandbox: ${c.primary(sandboxName)}`,
    );
    process.exit(1);
  }
}
