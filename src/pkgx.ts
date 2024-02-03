import { spawn } from "./lib.ts";

export async function run(
  command: string,
  stdout: "piped" | "inherit" = "inherit"
) {
  await setupPkgx();
  const env: Record<string, string> = {};

  if (Deno.env.has("POCKETENV_CONTEXT")) {
    env.TF_VAR_context = Deno.env.get("POCKETENV_CONTEXT")!;
  }

  if (!Deno.env.has("POCKETENV_CONTEXT") && !Deno.env.has("POCKETENV_IMAGE")) {
    env.TF_VAR_context = "./build";
  }

  if (Deno.env.has("POCKETENV_IMAGE")) {
    env.TF_VAR_image = Deno.env.get("POCKETENV_IMAGE")!;
  }

  const pkgx = new Deno.Command("pkgx", {
    args: command.trim().split(" "),
    stdin: "inherit",
    stdout,
    stderr: "inherit",
    env,
  });
  const process = pkgx.spawn();

  if (stdout === "inherit") {
    await process.status;
    return "";
  }

  const output = await process.output();
  return new TextDecoder().decode(output.stdout);
}

async function setupPkgx() {
  await spawn("sh", [
    "-c",
    "type pkgx > /dev/null || curl -fsS https://pkgx.sh | sh",
  ]);
}
