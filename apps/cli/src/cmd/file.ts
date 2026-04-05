import consola from "consola";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Sandbox } from "@pocketenv/sdk";
import CliTable3 from "cli-table3";
import { c } from "../theme";
import { editor } from "@inquirer/prompts";
import fs from "fs/promises";
import path from "path";
import { configureSdk } from "../lib/sdk";
import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import { env } from "../lib/env";

dayjs.extend(relativeTime);

export async function putFile(
  sandboxName: string,
  remotePath: string,
  localPath?: string,
) {
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

  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxName);
    await sandbox.file.write(remotePath, content);
    consola.success(
      `File ${c.primary(remotePath)} successfully created in sandbox ${c.primary(sandboxName)}`,
    );
  } catch (error) {
    consola.error(`Failed to create file: ${error}`);
  }
}

export async function listFiles(sandboxName: string) {
  await configureSdk();

  const sandbox = await Sandbox.get(sandboxName);
  const { files } = await sandbox.file.list();

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

  for (const file of files) {
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
      params: { id },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    });
    consola.success(`File ${c.primary(id)} successfully deleted from sandbox`);
  } catch (error) {
    consola.error(`Failed to delete file: ${error}`);
  }
}
