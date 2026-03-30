import consola from "consola";
import { client } from "../client";
import getAccessToken from "../lib/getAccessToken";
import type { Sandbox } from "../types/sandbox";
import connectToSandbox from "./ssh";
import { c } from "../theme";
import { expandRepo } from "../lib/expandRepo";
import waitUntilRunning from "../lib/waitUntilRunning";
import encrypt from "../lib/sodium";
import redact from "../lib/redact";

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

  const providerOptions: Record<string, any> = {};

  if (
    !["sprites", "daytona", "deno", "vercel", "cloudflare"].includes(
      provider ?? "cloudflare",
    )
  ) {
    consola.error(
      `Unsupported provider: ${provider}. Supported providers are: sprites, daytona, deno, vercel, cloudflare (default).`,
    );
    process.exit(1);
  }

  if (provider === "sprites") {
    const spriteToken = process.env.SPRITE_TOKEN;
    if (!spriteToken) {
      consola.error(
        "SPRITE_TOKEN environment variable is required for Sprites provider.",
      );
      process.exit(1);
    }
    providerOptions.spriteToken = await encrypt(spriteToken);
    providerOptions.redactedSpriteToken = redact(spriteToken);
  }

  if (provider === "daytona") {
    const daytonaApiKey = process.env.DAYTONA_API_KEY;
    const daytonaOrganizationId = process.env.DAYTONA_ORGANIZATION_ID;
    if (!daytonaApiKey || !daytonaOrganizationId) {
      consola.error(
        "DAYTONA_API_KEY and DAYTONA_ORGANIZATION_ID environment variables are required for Daytona provider.",
      );
      process.exit(1);
    }
    providerOptions.daytonaApiKey = await encrypt(daytonaApiKey);
    providerOptions.redactedDaytonaApiKey = redact(daytonaApiKey);
    providerOptions.daytonaOrganizationId = daytonaOrganizationId;
  }

  if (provider === "deno") {
    const denoDeployToken = process.env.DENO_DEPLOY_TOKEN;
    if (!denoDeployToken) {
      consola.error(
        "DENO_DEPLOY_TOKEN environment variable is required for Deno provider.",
      );
      process.exit(1);
    }
    providerOptions.denoDeployToken = await encrypt(denoDeployToken);
    providerOptions.redactedDenoDeployToken = redact(denoDeployToken);
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
        ...providerOptions,
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
    await waitUntilRunning(sandbox.data.name, token);
    await connectToSandbox(sandbox.data.name);
  } catch (error) {
    consola.error(`Failed to create sandbox: ${error}`);
  }
}

export default createSandbox;
