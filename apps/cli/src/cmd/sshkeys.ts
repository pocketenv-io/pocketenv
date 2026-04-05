import { editor, input } from "@inquirer/prompts";
import consola from "consola";
import fs from "node:fs/promises";
import { Sandbox } from "@pocketenv/sdk";
import chalk from "chalk";
import { configureSdk } from "../lib/sdk";

export async function getSshKey(sandboxName: string) {
  await configureSdk();

  try {
    const sandbox = await Sandbox.get(sandboxName);
    const sshKeys = await sandbox.sshKeys.get();

    consola.log("\nPrivate Key:");
    consola.log((sshKeys.privateKey ?? "").replace(/\\n/g, "\n"));
    consola.log("\nPublic Key:");
    consola.log(sshKeys.publicKey, "\n");
  } catch (error) {
    consola.info(
      `No SSH keys found for this sandbox.\n  Create one with ${chalk.greenBright(`pocketenv sshkeys put ${sandboxName} --generate`)}.`,
    );
  }
}

export async function putKeys(
  sandboxName: string,
  options: { generate?: boolean; publicKey?: string; privateKey?: string },
) {
  let privateKey: string | undefined;
  let publicKey: string | undefined;

  await configureSdk();
  const sandbox = await Sandbox.get(sandboxName);

  if (options.generate) {
    const generated = await sandbox.sshKeys.generate();
    privateKey = generated.privateKey;
    publicKey = generated.publicKey;
  }

  if (options.privateKey && !options.generate) {
    privateKey = await fs.readFile(options.privateKey, "utf8");
  }

  if (options.publicKey && !options.generate) {
    publicKey = await fs.readFile(options.publicKey, "utf8");
  }

  const validatePrivateKey = (value: string): string | true => {
    const trimmed = value.trim();
    if (!trimmed.startsWith("-----BEGIN")) {
      return "Private key must start with a PEM header (e.g. -----BEGIN OPENSSH PRIVATE KEY-----)";
    }
    if (!trimmed.endsWith("-----")) {
      return "Private key must end with a PEM footer (e.g. -----END OPENSSH PRIVATE KEY-----)";
    }
    return true;
  };

  if (!privateKey) {
    privateKey = (
      await editor({
        message: "Enter your SSH private key (opens in $EDITOR):",
        postfix: ".pem",
        waitForUserInput: false,
        validate: validatePrivateKey,
      })
    ).trim();
  }

  if (!publicKey) {
    publicKey = (
      await input({
        message: "Enter your SSH public key:",
        validate: (value: string): string | true =>
          value.trim().length > 0 ? true : "Public key cannot be empty.",
      })
    ).trim();
  }

  if (!sandbox) {
    consola.error(`Sandbox not found: ${chalk.greenBright(sandboxName)}`);
    process.exit(1);
  }

  try {
    await sandbox.sshKeys.put(publicKey, privateKey);
    consola.success("SSH keys saved successfully!");
  } catch {
    consola.error("Failed to save SSH keys");
  }
}
