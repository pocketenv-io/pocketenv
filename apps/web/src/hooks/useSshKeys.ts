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

function randomU32(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0]!;
}

function wrapPem(label: string, bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  const lines = base64.match(/.{1,70}/g)?.join("\n") ?? base64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function buildEd25519PublicKeyBlob(publicKey: Uint8Array): Uint8Array {
  return concatBytes(sshString(text("ssh-ed25519")), sshString(publicKey));
}

function buildOpenSSHEd25519PrivateKey(
  publicKey: Uint8Array,
  secretKey64: Uint8Array, // must be seed(32) || publicKey(32)
  comment: string,
): string {
  if (publicKey.length !== 32) {
    throw new Error("Invalid Ed25519 public key length");
  }

  if (secretKey64.length !== 64) {
    throw new Error("Invalid Ed25519 secret key length");
  }

  const publicBlob = buildEd25519PublicKeyBlob(publicKey);
  const checkint = randomU32();
  const commentBytes = text(comment);

  const privateSectionWithoutPadding = concatBytes(
    u32(checkint),
    u32(checkint),
    sshString(text("ssh-ed25519")),
    sshString(publicKey),
    sshString(secretKey64),
    sshString(commentBytes),
  );

  const blockSize = 8;
  const remainder = privateSectionWithoutPadding.length % blockSize;
  const padLen = remainder === 0 ? 0 : blockSize - remainder;

  const padding = new Uint8Array(padLen);
  for (let i = 0; i < padLen; i++) {
    padding[i] = i + 1;
  }

  const privateSection = concatBytes(privateSectionWithoutPadding, padding);

  const opensshKey = concatBytes(
    text("openssh-key-v1\0"),
    sshString(text("none")), // ciphername
    sshString(text("none")), // kdfname
    sshString(new Uint8Array()), // kdfoptions
    u32(1), // number of keys
    sshString(publicBlob), // public key
    sshString(privateSection), // private section
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

  const secretKey64 = concatBytes(seed, publicKey);

  const publicBlob = buildEd25519PublicKeyBlob(publicKey);

  const publicKeyOpenSSH = `ssh-ed25519 ${sodium.to_base64(publicBlob, sodium.base64_variants.ORIGINAL)} ${comment}`;

  const privateKeyOpenSSH = buildOpenSSHEd25519PrivateKey(
    publicKey,
    secretKey64,
    comment,
  );

  return {
    publicKey: publicKeyOpenSSH,
    privateKey: privateKeyOpenSSH,
    seedBase64: sodium.to_base64(seed, sodium.base64_variants.ORIGINAL),
  };
}
