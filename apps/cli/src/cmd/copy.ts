import ora from "ora";
import { c } from "../theme";
import { glob, unlink } from "node:fs/promises";
import ignore from "ignore";
import { readFile, lstat } from "node:fs/promises";
import { join } from "node:path";
import * as tar from "tar";
import crypto from "node:crypto";
import consola from "consola";
import getAccessToken from "../lib/getAccessToken";
import { client } from "../client";
import type { Sandbox } from "../types/sandbox";

async function copy(source: string, destination: string) {
  const spinner = ora(
    `Copying files from ${c.primary(source)} to ${c.primary(destination)}...`,
  ).start();

  if (!source.includes(":/") && destination.includes(":/")) {
    const sandboxId = destination.split(":/")[0]!;
    const token = await getAccessToken();

    const { data } = await client.get<{ sandbox: Sandbox }>(
      "/xrpc/io.pocketenv.sandbox.getSandbox",
      {
        params: {
          id: sandboxId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!data.sandbox) {
      consola.error(`Sandbox not found: ${c.primary(sandboxId)}`);
      process.exit(1);
    }

    if (data.sandbox.status !== "RUNNING") {
      consola.error(`Sandbox ${c.primary(sandboxId)} is not running.`);
      process.exit(1);
    }

    const output = await compressDirectory(source);
    const uuid = await uploadToStorage(output);
    consola.info(`Uploaded to storage with UUID: ${uuid}`);
    await unlink(output);

    await client.post(
      "/xrpc/io.pocketenv.sandbox.pullDirectory",
      {
        uuid,
        sandboxId,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
        },
      },
    );
  }

  if (source.includes(":/") && !destination.includes(":/")) {
  }

  if (source.includes(":/") && destination.includes(":/")) {
  }

  spinner.stopAndPersist({
    text: `Copied files from ${c.primary(source)} to ${c.primary(destination)}`,
  });
}

async function loadIgnore(...files: string[]) {
  const ig = ignore();
  for (const file of files) {
    try {
      ig.add(await readFile(file, "utf8"));
    } catch {
      // Ignore if the file doesn't exist
    }
  }
  return ig;
}

async function compressDirectory(source: string): Promise<string> {
  try {
    const ig = await loadIgnore(
      ".pocketenvignore",
      ".gitignore",
      ".npmignore",
      ".dockerignore",
    );
    const allFiles = await Array.fromAsync(
      glob("**/*", { cwd: source, exclude: (path) => ig.ignores(path) }),
    );
    const files = (
      await Promise.all(
        allFiles.map(async (file) => {
          const stat = await lstat(join(source, file));
          return stat.isSymbolicLink() ? null : file;
        }),
      )
    ).filter((f): f is string => f !== null);

    const output = `${crypto
      .createHash("sha256")
      .update(source)
      .digest("hex")}.tar.gz`;

    await tar.create(
      {
        cwd: source,
        file: output,
        portable: true,
        gzip: {
          level: 6,
        },
      },
      files,
    );

    return output;
  } catch (error) {
    consola.error("Failed to compress directory:", error);
    process.exit(1);
  }
}

async function uploadToStorage(filePath: string): Promise<string> {
  try {
    const token = await getAccessToken();

    const fileBuffer = await readFile(filePath);
    const form = new FormData();
    form.append(
      "file",
      new Blob([fileBuffer], { type: "application/gzip" }),
      "archive.tar.gz",
    );

    const BASE_URL = "https://sandbox.pocketenv.io";
    const response = await fetch(`${BASE_URL}/cp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
      },
      body: form,
    });
    const data = (await response.json()) as { uuid: string };
    return data.uuid;
  } catch (error) {
    consola.error("Failed to upload", error);
    process.exit(1);
  }
}

export default copy;
