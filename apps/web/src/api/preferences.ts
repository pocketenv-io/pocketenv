import { client } from ".";
import type { Preference } from "../types/preferences";

export const putPreferences = (sandboxId: string, preferences: Preference[]) =>
  client.post(
    "/xrpc/io.pocketenv.sandbox.putPreferences",
    { sandboxId, preferences },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getPreferences = (sandboxId: string) =>
  client.get<{ preferences: Preference[] }>(
    "/xrpc/io.pocketenv.sandbox.getPreferences",
    {
      params: { id: sandboxId },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
