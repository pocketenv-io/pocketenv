import consola from "consola";
import { client } from "../client";
import { env } from "../lib/env";
import getAccessToken from "../lib/getAccessToken";

async function deleteSandbox(id: string) {
  const token = await getAccessToken();
  client.post("/xrpc/io.pocketenv.sandbox.deleteSandbox", undefined, {
    params: {
      id,
    },
    headers: {
      Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
    },
  });

  consola.success("Sandbox deleted successfully");
}

export default deleteSandbox;
