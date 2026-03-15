import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import { password } from "@inquirer/prompts";
import type { Sandbox } from "../types/sandbox";
import type { Secret } from "../types/secret";
import chalk from "chalk";
import consola from "consola";
import Table from "cli-table3";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { env } from "../lib/env";
import encrypt from "../lib/sodium";

dayjs.extend(relativeTime);

export async function listSecrets(sandbox: string) {
  const token = await getAccessToken();
  const { data } = await client.get<{ sandbox: Sandbox }>(
    "/xrpc/io.pocketenv.sandbox.getSandbox",
    {
      params: {
        id: sandbox,
      },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );
  const response = await client.get<{ secrets: Secret[] }>(
    "/xrpc/io.pocketenv.secret.getSecrets",
    {
      params: {
        sandboxId: data.sandbox.id,
        offset: 0,
        limit: 100,
      },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  const table = new Table({
    head: [chalk.cyan("NAME"), chalk.cyan("CREATED AT")],
    chars: {
      top: "",
      "top-mid": "",
      "top-left": "",
      "top-right": "",
      bottom: "",
      "bottom-mid": "",
      "bottom-left": "",
      "bottom-right": "",
      left: "",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      right: "",
      "right-mid": "",
      middle: " ",
    },
    style: {
      border: [],
      head: [],
    },
  });

  for (const secret of response.data.secrets) {
    table.push([
      chalk.greenBright(secret.name),
      dayjs(secret.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export async function putSecret(sandbox: string, key: string) {
  const token = await getAccessToken();
  const value = await password({ message: "Enter secret value" });

  const { data } = await client.get("/xrpc/io.pocketenv.sandbox.getSandbox", {
    params: {
      id: sandbox,
    },
    headers: {
      Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
    },
  });

  if (!data.sandbox) {
    consola.error(`Sandbox not found: ${chalk.greenBright(sandbox)}`);
    process.exit(1);
  }

  await client.post(
    "/xrpc/io.pocketenv.secret.addSecret",
    {
      secret: {
        sandboxId: data.sandbox.id,
        name: key,
        value: await encrypt(value),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );
}

export async function deleteSecret(sandbox: string, key: string) {
  const token = await getAccessToken();
}
