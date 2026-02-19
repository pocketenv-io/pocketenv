import jwt from "@tsndr/cloudflare-worker-jwt";
import { env } from "./env";

export default function generateJwt(did: string) {
  return jwt.sign(
    {
      did,
    },
    env.JWT_SECRET,
  );
}
