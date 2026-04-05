import { Sandbox } from "@pocketenv/sdk";
import getAccessToken from "./getAccessToken";
import { env } from "./env";

export async function configureSdk(): Promise<void> {
  const token = await getAccessToken();
  Sandbox.configure({
    token: env.POCKETENV_TOKEN || token,
    baseUrl: env.POCKETENV_API_URL,
    publicKey: env.POCKETENV_PUBLIC_KEY,
  });
}
