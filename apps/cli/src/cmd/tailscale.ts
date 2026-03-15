import { password } from "@inquirer/prompts";
import getAccessToken from "../lib/getAccessToken";
import { client } from "../client";
import type { Sandbox } from "../types/sandbox";
import consola from "consola";
import chalk from "chalk";
import type { TailscaleAuthKey } from "../types/tailscale-auth-key";
import { env } from "../lib/env";
import encrypt from "../lib/sodium";

export async function putAuthKey(sandbox: string) {
  const token = await getAccessToken();

  const authKey = (
    await password({ message: "Enter Tailscale Auth Key" })
  ).trim();

  if (!authKey.startsWith("tskey-auth-")) {
    consola.error("Invalid Tailscale Auth Key");
    process.exit(1);
  }

  const { data } = await client.get<{ sandbox: Sandbox }>(
    "/xrpc/io.pocketenv.sandbox.getSandbox",
    {
      params: {
        id: sandbox,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!data.sandbox) {
    consola.error(`Sandbox not found: ${chalk.greenBright(sandbox)}`);
    process.exit(1);
  }

  const redacted =
    authKey.length > 14
      ? authKey.slice(0, 11) +
        "*".repeat(authKey.length - 14) +
        authKey.slice(-3)
      : authKey;

  await client.post(
    "/xrpc/io.pocketenv.sandbox.putTailscaleAuthKey",
    {
      id: data.sandbox.id,
      authKey: await encrypt(authKey),
      redacted,
    },
    {
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  consola.success(redacted);
  consola.success(
    `Tailscale auth key saved for sandbox: ${chalk.greenBright(sandbox)}`,
  );
}

export async function getTailscaleAuthKey(sandbox: string) {
  const token = await getAccessToken();

  const { data } = await client.get<{ sandbox: Sandbox }>(
    "/xrpc/io.pocketenv.sandbox.getSandbox",
    {
      params: {
        id: sandbox,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!data.sandbox) {
    consola.error(`Sandbox not found: ${chalk.greenBright(sandbox)}`);
    process.exit(1);
  }

  try {
    const { data: tailscale } = await client.get<TailscaleAuthKey>(
      "/xrpc/io.pocketenv.sandbox.getTailscaleAuthKey",
      {
        params: {
          id: data.sandbox.id,
        },
        headers: {
          Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
        },
      },
    );
    consola.info(`Tailscale auth key: ${chalk.greenBright(tailscale.authKey)}`);
  } catch {
    consola.error(
      `No Tailscale Auth Key found for sandbox: ${chalk.greenBright(sandbox)}`,
    );
    process.exit(1);
  }
}
