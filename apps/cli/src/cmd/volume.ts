import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../lib/getAccessToken";
import { client } from "../client";
import { env } from "../lib/env";
import type { Volume } from "../types/volume";
import CliTable3 from "cli-table3";
import { c } from "../theme";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export async function listVolumes(sandboxId: string) {
  const token = await getAccessToken();

  const response = await client.get<{ volumes: Volume[] }>(
    "/xrpc/io.pocketenv.volume.getVolumes",
    {
      params: {
        sandboxId,
      },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  const table = new CliTable3({
    head: [c.primary("NAME"), c.primary("PATH"), c.primary("CREATED AT")],
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

  for (const volume of response.data.volumes) {
    table.push([
      c.secondary(volume.name),
      volume.path,
      dayjs(volume.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export async function createVolume(
  sandbox: string,
  name: string,
  path: string,
) {
  const token = await getAccessToken();

  consola.success(
    `Volume ${chalk.rgb(0, 232, 198)(name)} successfully mounted in sandbox ${chalk.rgb(0, 232, 198)(sandbox)} at path ${chalk.rgb(0, 232, 198)(path)}`,
  );
}

export async function deleteVolume(sandbox: string, name: string) {
  const token = await getAccessToken();

  consola.success(
    `Volume ${chalk.rgb(0, 232, 198)(name)} successfully deleted from sandbox ${chalk.rgb(0, 232, 198)(sandbox)}`,
  );
}
