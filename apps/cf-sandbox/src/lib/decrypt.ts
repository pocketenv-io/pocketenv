import { env } from "cloudflare:workers";

export default async function decrypt(value: string): Promise<string> {
  const sodium = await import("libsodium-wrappers");
  await sodium.default.ready;

  const lib = sodium.default;

  const sealed = lib.from_base64(value, lib.base64_variants.URLSAFE_NO_PADDING);

  const decryptedBytes = lib.crypto_box_seal_open(
    sealed,
    lib.from_hex(env.PUBLIC_KEY),
    lib.from_hex(env.PRIVATE_KEY),
  );

  return lib.to_string(decryptedBytes);
}
