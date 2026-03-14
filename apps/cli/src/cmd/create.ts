import consola from "consola";
import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import type { Sandbox } from "../types/sandbox";
import chalk from "chalk";

async function createSandbox(
  name: string,
  { provider }: { provider: string | undefined },
) {
  const token = await getAccessToken();
  try {
    const sandbox = await client.post<Sandbox>(
      "/xrpc/io.pocketenv.sandbox.createSandbox",
      {
        name,
        base: "at://did:plc:aturpi2ls3yvsmhc6wybomun/io.pocketenv.sandbox/openclaw",
        provider: provider ?? "cloudflare",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    consola.success(
      `Sandbox created successfully: ${chalk.greenBright(sandbox.data.name)}`,
    );
  } catch (error) {
    consola.error(`Failed to create sandbox: ${error}`);
  }
}

export default createSandbox;
