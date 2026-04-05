import { Sandbox } from "@pocketenv/sdk";
import { password } from "@inquirer/prompts";
import chalk from "chalk";
import consola from "consola";
import Table from "cli-table3";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { c } from "../theme";
import { configureSdk } from "../lib/sdk";
import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import { env } from "../lib/env";

dayjs.extend(relativeTime);

export async function listSecrets(sandboxName: string) {
  await configureSdk();
  const sandbox = await Sandbox.get(sandboxName);
  const { secrets } = await sandbox.secret.list({ limit: 100, offset: 0 });

  const table = new Table({
    head: [c.primary("ID"), c.primary("NAME"), c.primary("CREATED AT")],
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

  for (const secret of secrets) {
    table.push([
      c.secondary(secret.id),
      c.highlight(secret.name),
      dayjs(secret.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export async function putSecret(sandboxName: string, key: string) {
  const isStdinPiped = !process.stdin.isTTY;
  const value = isStdinPiped
    ? await new Promise<string>((resolve) => {
        let data = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => (data += chunk));
        process.stdin.on("end", () => resolve(data.trimEnd()));
      })
    : await password({ message: "Enter secret value" });

  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxName);

    if (!sandbox) {
      consola.error(`Sandbox not found: ${chalk.greenBright(sandboxName)}`);
      process.exit(1);
    }

    await sandbox.secret.put(key, value);
    consola.success("Secret added successfully");
  } catch (error) {
    consola.error("Failed to add secret:", error);
  }
}

export async function deleteSecret(id: string) {
  const token = await getAccessToken();

  try {
    await client.post("/xrpc/io.pocketenv.secret.deleteSecret", undefined, {
      params: { id },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });

    consola.success("Secret deleted successfully");
  } catch (error) {
    consola.error("Failed to delete secret:", error);
  }
}
