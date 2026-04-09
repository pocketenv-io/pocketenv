import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import connectToSandbox from "./ssh";
import { c } from "../theme";
import { expandRepo } from "../lib/expandRepo";
import encrypt from "../lib/sodium";
import redact from "../lib/redact";
import { configureSdk } from "../lib/sdk";

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
  await configureSdk();
  if (repo) repo = expandRepo(repo);

  const providerOptions: Record<string, any> = {};

  if (
    !["sprites", "daytona", "deno", "vercel", "cloudflare", "modal"].includes(
      provider ?? "cloudflare",
    )
  ) {
    consola.error(
      `Unsupported provider: ${provider}. Supported providers are: sprites, daytona, deno, vercel, modal, cloudflare (default).`,
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

  if (provider === "vercel") {
    const vercelApiToken = process.env.VERCEL_API_TOKEN;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;
    if (!vercelApiToken || !vercelProjectId || !vercelTeamId) {
      consola.error(
        "VERCEL_API_TOKEN, VERCEL_PROJECT_ID and VERCEL_TEAM_ID environment variables are required for Vercel provider.",
      );
      process.exit(1);
    }
    providerOptions.vercelApiToken = await encrypt(vercelApiToken);
    providerOptions.redactedVercelApiToken = redact(vercelApiToken);
    providerOptions.vercelProjectId = vercelProjectId;
    providerOptions.vercelTeamId = vercelTeamId;
  }

  if (provider === "modal") {
    const modalTokenId = process.env.MODAL_TOKEN_ID;
    const modalTokenSecret = process.env.MODAL_TOKEN_SECRET;
    if (!modalTokenId || !modalTokenSecret) {
      consola.error(
        "MODAL_TOKEN_ID and MODAL_TOKEN_SECRET environment variables are required for Modal provider.",
      );
      process.exit(1);
    }
    providerOptions.modalTokenId = await encrypt(modalTokenId);
    providerOptions.redactedModalTokenId = redact(modalTokenId);
    providerOptions.modalTokenSecret = await encrypt(modalTokenSecret);
    providerOptions.redactedModalTokenSecret = redact(modalTokenSecret);
  }

  try {
    const sandbox = await Sandbox.create({
      name,
      base:
        base ??
        "at://did:plc:aturpi2ls3yvsmhc6wybomun/io.pocketenv.sandbox/openclaw",
      provider: provider ?? "cloudflare",
      repo,
      providerOptions,
    });
    if (!ssh) {
      consola.success(
        `Sandbox created successfully: ${c.primary(sandbox.data.name)}`,
      );
      return;
    }
    await sandbox.waitUntilRunning();
    await connectToSandbox(sandbox.data.name);
  } catch (error) {
    consola.error(`Failed to create sandbox: ${error}`);
  }
}

export default createSandbox;
