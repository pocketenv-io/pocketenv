import ora from "ora";
import { c } from "../theme";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { configureSdk } from "../lib/sdk";

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

  const onInterrupt = async () => {
    controller.abort();
    spinner.stop();
    process.exit(130);
  };

  process.once("SIGINT", onInterrupt);

  await configureSdk();

  try {
    if (!source.includes(":/") && destination.includes(":/")) {
      await localToSandbox(source, destination, signal);
    } else if (source.includes(":/") && !destination.includes(":/")) {
      await sandboxToLocal(source, destination, signal);
    } else if (source.includes(":/") && destination.includes(":/")) {
      await sandboxToSandbox(source, destination, signal);
    } else {
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

async function localToSandbox(
  source: string,
  destination: string,
  signal: AbortSignal,
) {
  const sandboxId = destination.split(":/")[0]!;
  const sandbox = await Sandbox.get(sandboxId);

  if (sandbox.data.status !== "RUNNING") {
    consola.error(`Sandbox ${c.primary(sandboxId)} is not running.`);
    process.exit(1);
  }

  await sandbox.copy.upload(source, destination.split(":")[1]!, { signal });
}

async function sandboxToLocal(
  source: string,
  destination: string,
  signal: AbortSignal,
) {
  const sandboxId = source.split(":/")[0]!;
  const sandbox = await Sandbox.get(sandboxId);

  if (sandbox.data.status !== "RUNNING") {
    consola.error(`Sandbox ${c.primary(sandboxId)} is not running.`);
    process.exit(1);
  }

  await sandbox.copy.download(source.split(":")[1]!, destination, { signal });
}

async function sandboxToSandbox(
  source: string,
  destination: string,
  signal: AbortSignal,
) {
  const sourceSandboxId = source.split(":/")[0]!;
  const destinationSandboxId = destination.split(":/")[0]!;

  const [sourceSandbox, destinationSandbox] = await Promise.all([
    Sandbox.get(sourceSandboxId),
    Sandbox.get(destinationSandboxId),
  ]);

  if (sourceSandbox.data.status !== "RUNNING") {
    consola.error(
      `Source Sandbox ${c.primary(sourceSandboxId)} is not running.`,
    );
    process.exit(1);
  }

  if (destinationSandbox.data.status !== "RUNNING") {
    consola.error(
      `Destination Sandbox ${c.primary(destinationSandboxId)} is not running.`,
    );
    process.exit(1);
  }

  await sourceSandbox.copy.to(
    destinationSandboxId,
    source.split(":")[1]!,
    destination.split(":")[1]!,
    { signal },
  );
}

export default copy;
