import sodium from "libsodium-wrappers";

export type SSHKeyPair = {
  publicKey: string;
  privateKey: string;
  seedBase64: string;
};

function u32(n: number): Uint8Array {
  return new Uint8Array([
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ]);
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}

function sshString(bytes: Uint8Array): Uint8Array {
  return concatBytes(u32(bytes.length), bytes);
}

function text(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function wrapPem(label: string, bytes: Uint8Array): string {
  const base64 = sodium.to_base64(bytes, sodium.base64_variants.ORIGINAL);
  const lines = base64.match(/.{1,70}/g)?.join("\n") ?? base64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
}

function buildEd25519PublicKeyBlob(publicKey: Uint8Array): Uint8Array {
  return concatBytes(sshString(text("ssh-ed25519")), sshString(publicKey));
}

function publicLineFromPublicKey(
  publicKey: Uint8Array,
  comment: string,
): string {
  const blob = buildEd25519PublicKeyBlob(publicKey);
  return `ssh-ed25519 ${sodium.to_base64(blob, sodium.base64_variants.ORIGINAL)} ${comment}`;
}

function buildOpenSSHEd25519PrivateKey(
  publicKey: Uint8Array,
  seed: Uint8Array,
  comment: string,
): string {
  if (publicKey.length !== 32) throw new Error("Invalid public key length");
  if (seed.length !== 32) throw new Error("Invalid seed length");

  const privateKey64 = concatBytes(seed, publicKey);
  const publicBlob = buildEd25519PublicKeyBlob(publicKey);
  const checkint = crypto.getRandomValues(new Uint32Array(1))[0]!;
  const commentBytes = text(comment);

  const privateSectionWithoutPadding = concatBytes(
    u32(checkint),
    u32(checkint),
    sshString(text("ssh-ed25519")),
    sshString(publicKey),
    sshString(privateKey64),
    sshString(commentBytes),
  );

  const blockSize = 8;
  const remainder = privateSectionWithoutPadding.length % blockSize;
  const padLen = remainder === 0 ? 0 : blockSize - remainder;

  const padding = new Uint8Array(padLen);
  for (let i = 0; i < padLen; i++) padding[i] = i + 1;

  const privateSection = concatBytes(privateSectionWithoutPadding, padding);

  const opensshKey = concatBytes(
    text("openssh-key-v1\0"),
    sshString(text("none")),
    sshString(text("none")),
    sshString(new Uint8Array()),
    u32(1),
    sshString(publicBlob),
    sshString(privateSection),
  );

  return wrapPem("OPENSSH PRIVATE KEY", opensshKey);
}

export async function generateEd25519SSHKeyPair(
  comment = "user@browser",
): Promise<SSHKeyPair> {
  await sodium.ready;

  const seed = new Uint8Array(32);
  crypto.getRandomValues(seed);

  const kp = sodium.crypto_sign_seed_keypair(seed);
  const publicKey = new Uint8Array(kp.publicKey);

  const publicKeyOpenSSH = publicLineFromPublicKey(publicKey, comment);
  const privateKeyOpenSSH = buildOpenSSHEd25519PrivateKey(
    publicKey,
    seed,
    comment,
  );

  return {
    publicKey: publicKeyOpenSSH,
    privateKey: privateKeyOpenSSH,
    seedBase64: sodium.to_base64(seed, sodium.base64_variants.ORIGINAL),
  };
}
