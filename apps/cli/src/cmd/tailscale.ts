import { input } from "@inquirer/prompts";
import getAccessToken from "../lib/getAccessToken";

export async function putAuthKey(sandbox: string) {
  const token = await getAccessToken();
}

export async function getTailscaleAuthKey(sandbox: string) {
  const token = await getAccessToken();
}
