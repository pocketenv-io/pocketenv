import ora from "ora";
import { c } from "../theme";
import {
  readdir,
  unlink,
  lstat,
  writeFile,
  mkdir,
  readFile,
} from "node:fs/promises";
import { loadIgnoreFiles, makeIsIgnored } from "../lib/ignore";
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

  if (source === destination) {
    consola.error("Source and destination cannot be the same.");
    process.exit(1);
  }

  const controller = new AbortController();
  const { signal } = controller;
  const tempFiles: string[] = [];

  const onInterrupt = async () => {
    controller.abort();
    spinner.stop();
    await Promise.allSettled(tempFiles.map((f) => unlink(f)));
    process.exit(130);
  };

  process.once("SIGINT", onInterrupt);

  try {
    if (!source.includes(":/") && destination.includes(":/")) {
      await localToSandbox(source, destination, signal, tempFiles);
    }

    if (source.includes(":/") && !destination.includes(":/")) {
      await sandboxToLocal(source, destination, signal, tempFiles);
    }

    if (source.includes(":/") && destination.includes(":/")) {
      await sandboxToSandbox(source, destination, signal);
    }

    if (!source.includes(":/") && !destination.includes(":/")) {
      consola.error("Both source and destination cannot be local paths.");
      process.exit(1);
    }

    spinner.stopAndPersist({
      text: `Copied files from ${c.primary(source)} to ${c.primary(destination)}`,
    });
  } finally {
    process.off("SIGINT", onInterrupt);
  }
}

async function compressDirectory(source: string): Promise<string> {
  try {
    if ((await lstat(source)).isFile()) {
      const output = `${crypto
        .createHash("sha256")
        .update(source)
        .digest("hex")}.tar.gz`;
      await tar.create(
        {
          file: output,
          gzip: {
            level: 6,
          },
        },
        [source],
      );
      return output;
    }

    const isIgnored = makeIsIgnored(await loadIgnoreFiles(source));
    // readdir with recursive:true includes hidden files/dirs (.git, .env, …)
    // which glob("**/*") silently skips.
    const files = (
      await Promise.all(
        (await readdir(source, { recursive: true })).map(async (entry) => {
          if (isIgnored(entry)) return null;
          const stat = await lstat(join(source, entry));
          if (stat.isDirectory() || stat.isSymbolicLink()) return null;
          return entry;
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

async function decompressDirectory(archive: string, destination: string) {
  try {
    await mkdir(destination, { recursive: true });
    await tar.extract({
      file: archive,
      cwd: destination,
    });
  } catch (error) {
    consola.error("Failed to decompress archive:", error);
    process.exit(1);
  }
}

async function uploadToStorage(
  filePath: string,
  signal: AbortSignal,
): Promise<string> {
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
      signal,
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

async function localToSandbox(
  source: string,
  destination: string,
  signal: AbortSignal,
  tempFiles: string[],
) {
  const sandboxId = destination.split(":/")[0]!;
  const token = await getAccessToken();

  const { data } = await client.get<{ sandbox: Sandbox }>(
    "/xrpc/io.pocketenv.sandbox.getSandbox",
    {
      params: { id: sandboxId },
      signal,
      headers: { Authorization: `Bearer ${token}` },
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
  tempFiles.push(output);

  signal.throwIfAborted();

  const uuid = await uploadToStorage(output, signal);
  await unlink(output);
  tempFiles.splice(tempFiles.indexOf(output), 1);

  await client.post(
    "/xrpc/io.pocketenv.sandbox.pullDirectory",
    { uuid, sandboxId, directoryPath: destination.split(":")[1] },
    {
      signal,
      headers: {
        Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
      },
    },
  );
}

async function sandboxToLocal(
  source: string,
  destination: string,
  signal: AbortSignal,
  tempFiles: string[],
) {
  const token = await getAccessToken();
  const sandboxId = source.split(":/")[0]!;

  const { data } = await client.get<{ sandbox: Sandbox }>(
    "/xrpc/io.pocketenv.sandbox.getSandbox",
    {
      params: { id: sandboxId },
      signal,
      headers: {
        Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
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

  const response = await client.post<{ uuid: string }>(
    "/xrpc/io.pocketenv.sandbox.pushDirectory",
    { sandboxId, directoryPath: source.split(":")[1] },
    {
      signal,
      headers: {
        Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  const { uuid } = response.data;

  const downloadResponse = await fetch(
    `https://sandbox.pocketenv.io/cp/${uuid}`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  if (!downloadResponse.ok) {
    consola.error(`Failed to download archive: ${downloadResponse.statusText}`);
    process.exit(1);
  }

  const arrayBuffer = await downloadResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tempFile = `${crypto.randomBytes(16).toString("hex")}.tar.gz`;
  tempFiles.push(tempFile);
  await writeFile(tempFile, buffer);
  await decompressDirectory(tempFile, destination);
  await unlink(tempFile);
  tempFiles.splice(tempFiles.indexOf(tempFile), 1);
}

async function sandboxToSandbox(
  source: string,
  destination: string,
  signal: AbortSignal,
) {
  const sourceSandboxId = source.split(":/")[0]!;
  const destinationSandboxId = destination.split(":/")[0]!;

  const token = await getAccessToken();

  const [{ data: sourceSandbox }, { data: destinationSandbox }] =
    await Promise.all([
      client.get<{ sandbox: Sandbox }>(
        "/xrpc/io.pocketenv.sandbox.getSandbox",
        {
          params: { id: sourceSandboxId },
          signal,
          headers: {
            Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
          },
        },
      ),
      client.get<{ sandbox: Sandbox }>(
        "/xrpc/io.pocketenv.sandbox.getSandbox",
        {
          params: { id: destinationSandboxId },
          signal,
          headers: {
            Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
          },
        },
      ),
    ]);

  if (!sourceSandbox.sandbox) {
    consola.error(`Source sandbox not found: ${c.primary(sourceSandboxId)}`);
    process.exit(1);
  }

  if (!destinationSandbox.sandbox) {
    consola.error(
      `Destination Sandbox not found: ${c.primary(destinationSandboxId)}`,
    );
    process.exit(1);
  }

  if (sourceSandbox.sandbox.status !== "RUNNING") {
    consola.error(
      `Source Sandbox ${c.primary(sourceSandboxId)} is not running.`,
    );
    process.exit(1);
  }

  if (destinationSandbox.sandbox.status !== "RUNNING") {
    consola.error(
      `Destination Sandbox ${c.primary(destinationSandboxId)} is not running.`,
    );
    process.exit(1);
  }

  const { data } = await client.post<{ uuid: string }>(
    "/xrpc/io.pocketenv.sandbox.pushDirectory",
    { sandboxId: sourceSandboxId, directoryPath: source.split(":")[1] },
    {
      signal,
      headers: {
        Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  await client.post(
    "/xrpc/io.pocketenv.sandbox.pullDirectory",
    {
      uuid: data.uuid,
      sandboxId: destinationSandboxId,
      directoryPath: destination.split(":")[1],
    },
    {
      signal,
      headers: {
        Authorization: `Bearer ${process.env.POCKETENV_TOKEN || token}`,
      },
    },
  );
}

export default copy;
