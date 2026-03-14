import { input } from "@inquirer/prompts";
import getAccessToken from "../lib/getAccessToken";

export async function getSshKey(sandbox: string) {
  const token = await getAccessToken();
}

export async function putKeys(sandbox: string) {
  const token = await getAccessToken();
}
