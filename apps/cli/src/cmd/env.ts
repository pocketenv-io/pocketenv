import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import type { Sandbox } from "../types/sandbox";
import type { Variable } from "../types/variable";
import dayjs from "dayjs";
import consola from "consola";
import Table from "cli-table3";
import { env } from "../lib/env";
import { c } from "../theme";

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

  if (!data.sandbox) {
    consola.error(`Sandbox not found: ${c.primary(sandbox)}`);
    process.exit(1);
  }

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
    head: [
      c.primary("ID"),
      c.primary("NAME"),
      c.primary("VALUE"),
      c.primary("CREATED AT"),
    ],
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
      c.secondary(variable.id),
      c.highlight(variable.name),
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

export async function deleteEnv(id: string) {
  const token = await getAccessToken();

  try {
    await client.post("/xrpc/io.pocketenv.variable.deleteVariable", undefined, {
      params: { id },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });

    consola.success("Variable deleted successfully");
  } catch {
    consola.error("Failed to delete variable");
  }
}
