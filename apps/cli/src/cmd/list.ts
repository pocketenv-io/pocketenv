import { client } from "../client";
import chalk from "chalk";
import consola from "consola";
import { env } from "../lib/env";
import getAccessToken from "../lib/getAccessToken";
import type { Sandbox } from "../types/sandbox";
import Table from "cli-table3";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Profile } from "../types/profile";
dayjs.extend(relativeTime);

async function listSandboxes() {
  const token = await getAccessToken();

  const profile = await client.get<Profile>(
    "/xrpc/io.pocketenv.actor.getProfile",
    {
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  const response = await client.get<{ sandboxes: Sandbox[] }>(
    `/xrpc/io.pocketenv.actor.getActorSandboxes?did=${profile.data.did}&offset=0&limit=100`,
  );

  const table = new Table({
    head: [
      chalk.cyan("NAME"),
      chalk.cyan("BASE"),
      chalk.cyan("STATUS"),
      chalk.cyan("CREATED AT"),
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

  for (const sandbox of response.data.sandboxes) {
    table.push([
      chalk.greenBright(sandbox.name),
      sandbox.baseSandbox,
      sandbox.status,
      dayjs(sandbox.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export default listSandboxes;
