import sodium from "libsodium-wrappers";
import { env } from "./env";

await sodium.ready;

export default function decrypt(value: string): string {
  const sealed = sodium.from_base64(
    value,
    sodium.base64_variants.URLSAFE_NO_PADDING,
  );
  let decryptedBytes = sodium.crypto_box_seal_open(
    sealed,
    sodium.from_hex(env.PUBLIC_KEY),
    sodium.from_hex(env.PRIVATE_KEY),
  );
  return sodium.to_string(decryptedBytes);
}
