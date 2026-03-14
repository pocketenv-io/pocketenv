import { editor, input } from "@inquirer/prompts";
import getAccessToken from "../lib/getAccessToken";
import { generateEd25519SSHKeyPair } from "../lib/sshKeys";
import consola from "consola";

export async function getSshKey(sandbox: string) {
  const token = await getAccessToken();
}

export async function putKeys(
  sandbox: string,
  { generate }: { generate: boolean | undefined },
) {
  const token = await getAccessToken();
  if (generate) {
    const { privateKey, publicKey } = await generateEd25519SSHKeyPair();
    consola.log("\nPrivate Key:\n");
    consola.log(privateKey);
    consola.log("\nPublic Key:\n");
    consola.log(publicKey, "\n");

    consola.success("SSH keys generated successfully!");
    return;
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

  const privateKey = (
    await editor({
      message: "Enter your SSH private key (opens in $EDITOR):",
      postfix: ".pem",
      waitForUserInput: false,
      validate: validatePrivateKey,
    })
  ).trim();

  const publicKey = (
    await input({
      message: "Enter your SSH public key:",
      validate: (value: string): string | true =>
        value.trim().length > 0 ? true : "Public key cannot be empty.",
    })
  ).trim();

  consola.log("\nPrivate Key:\n");
  consola.log(privateKey);
  consola.log("\nPublic Key:\n");
  consola.log(publicKey, "\n");

  consola.success("SSH keys saved successfully!");
}
