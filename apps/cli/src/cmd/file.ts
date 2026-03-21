import consola from "consola";
import getAccessToken from "../lib/getAccessToken";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { client } from "../client";
import { env } from "../lib/env";
import CliTable3 from "cli-table3";
import type { File } from "../types/file";
import { c } from "../theme";
import { editor } from "@inquirer/prompts";
import fs from "fs/promises";
import path from "path";
import encrypt from "../lib/sodium";

dayjs.extend(relativeTime);

export async function putFile(
  sandbox: string,
  remotePath: string,
  localPath?: string,
) {
  const token = await getAccessToken();

  let content: string;
  if (!process.stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    content = Buffer.concat(chunks).toString().trim();
  } else if (localPath) {
    const resolvedPath = path.resolve(localPath);
    try {
      await fs.access(resolvedPath);
    } catch (err) {
      consola.error(`No such file: ${c.error(localPath)}`);
      process.exit(1);
    }
    content = await fs.readFile(resolvedPath, "utf-8");
  } else {
    content = (
      await editor({
        message: "File content (opens in $EDITOR):",
        waitForUserInput: false,
      })
    ).trim();
  }

  try {
    await client.post(
      "/xrpc/io.pocketenv.file.addFile",
      {
        file: {
          sandboxId: sandbox,
          path: remotePath,
          content: await encrypt(content),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
        },
      },
    );

    consola.success(
      `File ${c.primary(remotePath)} successfully created in sandbox ${c.primary(sandbox)}`,
    );
  } catch (error) {
    consola.error(`Failed to create file: ${error}`);
  }
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

export async function deleteFile(id: string) {
  const token = await getAccessToken();

  try {
    await client.post(`/xrpc/io.pocketenv.file.deleteFile`, undefined, {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });
    consola.success(`File ${c.primary(id)} successfully deleted from sandbox`);
  } catch (error) {
    consola.error(`Failed to delete file: ${error}`);
  }
}
