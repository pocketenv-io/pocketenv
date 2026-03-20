import chalk from "chalk";
import consola from "consola";
import getAccessToken from "../lib/getAccessToken";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { client } from "../client";
import { env } from "../lib/env";
import CliTable3 from "cli-table3";
import type { File } from "../types/file";
import { c } from "../theme";

dayjs.extend(relativeTime);

export async function putFile(sandbox: string, path: string) {
  const token = await getAccessToken();

  consola.success(
    `File ${chalk.rgb(0, 232, 198)(path)} successfully created in sandbox ${chalk.rgb(0, 232, 198)(sandbox)}`,
  );
}

export async function listFiles(sandboxId: string) {
  const token = await getAccessToken();

  const response = await client.get<{ files: File[] }>(
    "/xrpc/io.pocketenv.file.getFiles",
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
    head: [c.primary("ID"), c.primary("PATH"), c.primary("CREATED AT")],
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

  for (const file of response.data.files) {
    table.push([
      c.secondary(file.id),
      file.path,
      dayjs(file.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export async function deleteFile(sandbox: string, id: string) {
  const token = await getAccessToken();

  consola.success(
    `File ${chalk.rgb(0, 232, 198)(id)} successfully deleted from sandbox ${chalk.rgb(0, 232, 198)(sandbox)}`,
  );
}
