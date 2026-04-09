import sodium from "libsodium-wrappers";
import process from "node:process";

await sodium.ready;

export default function decrypt(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const { PUBLIC_KEY, PRIVATE_KEY } = process.env;
  if (!PUBLIC_KEY || !PRIVATE_KEY) {
    throw new Error(
      "PUBLIC_KEY and PRIVATE_KEY environment variables must be set for decryption",
    );
  }

  const sealed = sodium.from_base64(
    value,
    sodium.base64_variants.URLSAFE_NO_PADDING,
  );
  const decryptedBytes = sodium.crypto_box_seal_open(
    sealed,
    sodium.from_hex(PUBLIC_KEY),
    sodium.from_hex(PRIVATE_KEY),
  );
  return sodium.to_string(decryptedBytes);
}
