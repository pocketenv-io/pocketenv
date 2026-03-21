import consola from "consola";
import getAccessToken from "../lib/getAccessToken";
import { client } from "../client";
import { env } from "../lib/env";
import { c } from "../theme";

export async function exposePort(
  sandbox: string,
  port: number,
  description?: string,
) {
  const token = await getAccessToken();
  try {
    const response = await client.post<{ previewUrl?: string }>(
      `/xrpc/io.pocketenv.sandbox.exposePort`,
      { port, description },
      {
        params: {
          id: sandbox,
        },
        headers: {
          Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
        },
      },
    );

    consola.success(
      `Port ${c.primary(port)} exposed for sandbox ${c.primary(sandbox)}`,
    );

    if (response.data.previewUrl) {
      consola.success(`Preview URL: ${c.secondary(response.data.previewUrl)}`);
    }
  } catch (error) {
    consola.error("Failed to expose port:", error);
    process.exit(1);
  }
}
