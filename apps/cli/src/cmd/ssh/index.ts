import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../../lib/getAccessToken";
import { client } from "../../client";
import { env } from "../../lib/env";
import type { Sandbox } from "../../types/sandbox";
import type { Profile } from "../../types/profile";
import cloudflare from "./cloudflare";
import tty from "./tty";
import terminal from "./terminal";

async function ssh(sandboxName: string | undefined) {
  const token = await getAccessToken();
  const authToken = env.POCKETENV_TOKEN || token;

  let sandbox: Sandbox;

  if (!sandboxName) {
    // No name provided – list the user's sandboxes and pick the first running one.
    const profile = await client.get<Profile>(
      "/xrpc/io.pocketenv.actor.getProfile",
      { headers: { Authorization: `Bearer ${authToken}` } },
    );

    const response = await client.get<{ sandboxes: Sandbox[] }>(
      "/xrpc/io.pocketenv.actor.getActorSandboxes",
      {
        params: { did: profile.data.did, offset: 0, limit: 100 },
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    const runningSandboxes = response.data.sandboxes.filter(
      (s) => s.status === "RUNNING",
    );

    if (runningSandboxes.length === 0) {
      consola.error(
        `No running sandboxes found. ` +
          `Start one with ${chalk.greenBright("pocketenv start <sandbox>")} first.`,
      );
      process.exit(1);
    }

    sandbox = runningSandboxes[0] as Sandbox;
    consola.info(`Connecting to sandbox ${chalk.greenBright(sandbox.name)}…`);
  } else {
    // Look up the named sandbox.
    const response = await client.get<{ sandbox: Sandbox | null }>(
      "/xrpc/io.pocketenv.sandbox.getSandbox",
      {
        params: { id: sandboxName },
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );

    if (!response.data.sandbox) {
      consola.error(`Sandbox ${chalk.yellowBright(sandboxName)} not found.`);
      process.exit(1);
    }

    sandbox = response.data.sandbox;
  }

  if (sandbox.status !== "RUNNING") {
    consola.error(
      `Sandbox ${chalk.yellowBright(sandbox.name)} is not running. ` +
        `Start it with ${chalk.greenBright(`pocketenv start ${sandbox.name}`)}.`,
    );
    process.exit(1);
  }

  // export type Provider = "daytona" | "deno" | "cloudflare" | "vercel" | "sprites";
  switch (sandbox.provider) {
    case "cloudflare":
      await cloudflare(sandbox);
      break;
    case "daytona":
      await terminal(sandbox);
      break;
    case "deno":
      await terminal(sandbox);
      break;
    case "vercel":
      // await terminal(sandbox);
      break;
    case "sprites":
      await tty(sandbox);
      break;
    default:
      consola.error(
        `Sandbox ${chalk.yellowBright(sandbox.name)} uses provider ` +
          `${chalk.cyan(sandbox.provider)}, but this command only supports ` +
          `${chalk.cyan("cloudflare")}, ${chalk.cyan("daytona")}, ${chalk.cyan("deno")}, ${chalk.cyan("vercel")}, or ${chalk.cyan("sprites")} sandboxes.`,
      );
      process.exit(1);
  }
}

export default ssh;
