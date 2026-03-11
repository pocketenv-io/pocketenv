import { client } from ".";
import type { TailscaleAuthKey } from "../types/tailscale-auth-key";

export const saveTailscaleAuthKey = (
  sandboxId: string,
  authKey: string,
  redacted: string,
) =>
  client.post(
    "/xrpc/io.pocketenv.sandbox.putTailscaleAuthKey",
    {
      id: sandboxId,
      authKey,
      redacted,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getTailscaleAuthKey = (sandboxId: string) =>
  client.get<TailscaleAuthKey>(
    "/xrpc/io.pocketenv.sandbox.getTailscaleAuthKey",
    {
      params: {
        id: sandboxId,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
