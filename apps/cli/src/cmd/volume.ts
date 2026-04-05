import chalk from "chalk";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import CliTable3 from "cli-table3";
import { c } from "../theme";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { configureSdk } from "../lib/sdk";
import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import { env } from "../lib/env";

dayjs.extend(relativeTime);

export async function listVolumes(sandboxName: string) {
  await configureSdk();

  const sandbox = await Sandbox.get(sandboxName);
  const { volumes } = await sandbox.volume.list();

  const table = new CliTable3({
    head: [
      c.primary("ID"),
      c.primary("NAME"),
      c.primary("PATH"),
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

  for (const volume of volumes) {
    table.push([
      c.secondary(volume.id),
      volume.name,
      volume.path ?? "",
      dayjs(volume.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export async function createVolume(
  sandboxName: string,
  name: string,
  volumePath: string,
) {
  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxName);
    await sandbox.volume.create(name, { path: volumePath });

    consola.success(
      `Volume ${chalk.rgb(0, 232, 198)(name)} successfully mounted in sandbox ${chalk.rgb(0, 232, 198)(sandboxName)} at path ${chalk.rgb(0, 232, 198)(volumePath)}`,
    );
  } catch (error) {
    consola.error("Failed to create volume:", error);
  }
}

export async function deleteVolume(id: string) {
  const token = await getAccessToken();

  try {
    await client.post(`/xrpc/io.pocketenv.volume.deleteVolume`, undefined, {
      params: { id },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });
  } catch (error) {
    consola.error(`Failed to delete volume: ${error}`);
    return;
  }

  consola.success(
    `Volume ${chalk.rgb(0, 232, 198)(id)} successfully deleted from sandbox`,
  );
}
