import { editor, input } from "@inquirer/prompts";
import getAccessToken from "../lib/getAccessToken";
import { generateEd25519SSHKeyPair } from "../lib/sshKeys";
import consola from "consola";
import fs from "node:fs/promises";
import encrypt from "../lib/sodium";
import { client } from "../client";
import type { Sandbox } from "../types/sandbox";
import { env } from "../lib/env";

export async function getSshKey(sandbox: string) {
  const token = await getAccessToken();
}

export async function putKeys(
  sandbox: string,
  options: { generate?: boolean; publicKey?: string; privateKey?: string },
) {
  const token = await getAccessToken();
  let privateKey: string | undefined;
  let publicKey: string | undefined;

  if (options.generate) {
    const generated = await generateEd25519SSHKeyPair("");
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

  const { data } = await client.get<{ sandbox: Sandbox }>(
    "/xrpc/io.pocketenv.sandbox.getSandbox",
    {
      params: {
        id: sandbox,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const encryptedPrivateKey = await encrypt(privateKey);

  const redacted = (() => {
    const header = "-----BEGIN OPENSSH PRIVATE KEY-----";
    const footer = "-----END OPENSSH PRIVATE KEY-----";
    const headerIndex = privateKey.indexOf(header);
    const footerIndex = privateKey.indexOf(footer);
    if (headerIndex === -1 || footerIndex === -1)
      return privateKey.replace(/\n/g, "\\n");
    const body = privateKey.slice(headerIndex + header.length, footerIndex);
    const chars = body.split("");
    const nonNewlineIndices = chars
      .map((c, i) => (c !== "\n" ? i : -1))
      .filter((i) => i !== -1);
    const maskedBody =
      nonNewlineIndices.length > 15
        ? (() => {
            const middleIndices = nonNewlineIndices.slice(10, -5);
            middleIndices.forEach((i) => {
              chars[i] = "*";
            });
            return chars.join("");
          })()
        : body;
    return `${header}${maskedBody}${footer}`.replace(/\n/g, "\\n");
  })();

  await client.post(
    "/xrpc/io.pocketenv.sandbox.putSshKeys",
    {
      id: data.sandbox.id,
      privateKey: encryptedPrivateKey,
      publicKey,
      redacted,
    },
    {
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  consola.log("\nPrivate Key:\n");
  consola.log(redacted.replace(/\\n/g, "\n"));
  consola.log("\nPublic Key:\n");
  consola.log(publicKey, "\n");

  consola.success("SSH keys saved successfully!");
}
