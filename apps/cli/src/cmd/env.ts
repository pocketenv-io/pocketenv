import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import type { Sandbox } from "../types/sandbox";
import type { Variable } from "../types/variable";
import chalk from "chalk";
import dayjs from "dayjs";
import consola from "consola";
import Table from "cli-table3";
import { env } from "../lib/env";

export async function listEnvs(sandbox: string) {
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
  const response = await client.get<{ variables: Variable[] }>(
    "/xrpc/io.pocketenv.variable.getVariables",
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
    head: [chalk.cyan("NAME"), chalk.cyan("VALUE"), chalk.cyan("CREATED AT")],
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

  for (const variable of response.data.variables) {
    table.push([
      chalk.greenBright(variable.name),
      variable.value,
      dayjs(variable.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export async function putEnv(sandbox: string, key: string, value: string) {
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

  await client.post(
    "/xrpc/io.pocketenv.variable.addVariable",
    {
      variable: { sandboxId: data.sandbox.id, name: key, value: value },
    },
    {
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  consola.success("Variable updated successfully");
}

export async function deleteEnv(sandbox: string, key: string) {
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

  await client.post("/xrpc/io.pocketenv.variable.deleteVariable", {
    params: {
      sandboxId: data.sandbox.id,
      name: key,
    },
    headers: {
      Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
    },
  });

  consola.success("Variable deleted successfully");
}
