import { useEffect, useState } from "react";

export const useSshKeys = () => {
  const [keyPair, setKeyPair] = useState<{
    opensshPublicKey: string;
    privateKeyPem: string;
    rawPublicKeyBase64: string;
  }>({ opensshPublicKey: "", privateKeyPem: "", rawPublicKeyBase64: "" });

  const bytesToBase64 = (bytes: Uint8Array) => {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  };

  const stringToBytes = (str: string) => {
    return new TextEncoder().encode(str);
  };

  const concatBytes = (...arrays: Uint8Array[]) => {
    const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const arr of arrays) {
      out.set(arr, offset);
      offset += arr.length;
    }
    return out;
  };

  const uint32be = (n: number) => {
    return new Uint8Array([
      (n >>> 24) & 0xff,
      (n >>> 16) & 0xff,
      (n >>> 8) & 0xff,
      n & 0xff,
    ]);
  };

  const sshString = (bytes: Uint8Array) => {
    return concatBytes(uint32be(bytes.length), bytes);
  };

  const pemEncode = (label: string, arrayBuffer: ArrayBuffer) => {
    const base64 = bytesToBase64(new Uint8Array(arrayBuffer));
    const lines = base64?.match(/.{1,64}/g)?.join("\n");
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
  };

  const generateEd25519KeyPair = async () => {
    const keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
      "sign",
      "verify",
    ]);

    // Export raw public key: 32 bytes
    const rawPublic = new Uint8Array(
      await crypto.subtle.exportKey("raw", keyPair.publicKey),
    );

    // string "ssh-ed25519" + string rawPublicKey
    const algo = stringToBytes("ssh-ed25519");
    const publicPayload = concatBytes(sshString(algo), sshString(rawPublic));

    const opensshPublicKey = `ssh-ed25519 ${bytesToBase64(publicPayload)}`;

    // Export private key as PKCS#8 PEM
    const pkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    const privateKeyPem = pemEncode("PRIVATE KEY", pkcs8);

    return {
      opensshPublicKey,
      privateKeyPem,
      rawPublicKeyBase64: bytesToBase64(rawPublic),
    };
  };

  useEffect(() => {
    generateEd25519KeyPair().then((keys) => setKeyPair(keys));
  });

  return {
    bytesToBase64,
    stringToBytes,
    concatBytes,
    generateEd25519KeyPair,
    keyPair,
  };
};
