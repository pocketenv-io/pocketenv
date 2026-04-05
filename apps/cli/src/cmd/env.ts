import { Sandbox } from "@pocketenv/sdk";
import dayjs from "dayjs";
import consola from "consola";
import Table from "cli-table3";
import { c } from "../theme";
import { configureSdk } from "../lib/sdk";
import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import { env } from "../lib/env";

export async function listEnvs(sandboxName: string) {
  await configureSdk();
  const sandbox = await Sandbox.get(sandboxName);
  const { variables } = await sandbox.env.list({ limit: 100, offset: 0 });

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

  for (const variable of variables) {
    table.push([
      c.secondary(variable.id),
      c.highlight(variable.name),
      variable.value,
      dayjs(variable.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export async function putEnv(sandboxName: string, key: string, value: string) {
  await configureSdk();
  const sandbox = await Sandbox.get(sandboxName);
  await sandbox.env.put(key, value);
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
