import sodium from "libsodium-wrappers";
import { useEffect, useState } from "react";

export const useSodium = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    sodium.ready.then(() => {
      setIsInitialized(true);
    });
  }, []);

  const cryptoBoxSeal = sodium.crypto_box_seal;
  const fromString = sodium.from_string;
  const fromHex = sodium.from_hex;
  const toBase64 = sodium.to_base64;
  const base64Variants = sodium.base64_variants;

  return {
    isInitialized,
    sodium,
    cryptoBoxSeal,
    fromString,
    fromHex,
    toBase64,
    base64Variants,
  };
};
