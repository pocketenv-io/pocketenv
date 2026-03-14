import sodium from "libsodium-wrappers";
import { env } from "./env";

async function encrypt(message: string): Promise<string> {
  await sodium.ready;

  const sealed = sodium.crypto_box_seal(
    sodium.from_string(message),
    sodium.from_hex(env.POCKETENV_PUBLIC_KEY),
  );

  return sodium.to_base64(sealed, sodium.base64_variants.URLSAFE_NO_PADDING);
}

export default encrypt;
