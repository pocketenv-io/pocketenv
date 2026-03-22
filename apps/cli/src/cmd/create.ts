import consola from "consola";
import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import type { Sandbox } from "../types/sandbox";
import connectToSandbox from "./ssh";
import { c } from "../theme";
import { expandRepo } from "../lib/expandRepo";

async function createSandbox(
  name: string,
  {
    provider,
    ssh,
    base,
    repo,
  }: {
    provider?: string;
    ssh?: boolean;
    base?: string;
    repo?: string;
  },
) {
  const token = await getAccessToken();
  if (repo) repo = expandRepo(repo);

  if (["deno", "vercel", "daytona"].includes(provider || "")) {
    consola.error(
      `This Sandbox Runtime is temporarily disabled. ${c.primary(provider ?? "")}`,
    );
    process.exit(1);
  }
  try {
    const sandbox = await client.post<Sandbox>(
      "/xrpc/io.pocketenv.sandbox.createSandbox",
      {
        name,
        base:
          base ??
          "at://did:plc:aturpi2ls3yvsmhc6wybomun/io.pocketenv.sandbox/openclaw",
        provider: provider ?? "cloudflare",
        repo,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!ssh) {
      consola.success(
        `Sandbox created successfully: ${c.primary(sandbox.data.name)}`,
      );
      return;
    }
    await connectToSandbox(sandbox.data.name);
  } catch (error) {
    consola.error(`Failed to create sandbox: ${error}`);
  }
}

export default createSandbox;
