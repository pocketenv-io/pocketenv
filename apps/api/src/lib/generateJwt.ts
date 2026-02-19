import jwt from "@tsndr/cloudflare-worker-jwt";
import { env } from "./env";

export default function generateJwt(did: string): Promise<string> {
  return jwt.sign(
    {
      sub: did,
    },
    env.JWT_SECRET,
  );
}
