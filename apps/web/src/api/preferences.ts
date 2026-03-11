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
