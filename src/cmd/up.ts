import { pkgx } from "../../deps.ts";
import { existsSync } from "node:fs";
import { POCKETENV_CACHE_DIR } from "../consts.ts";
import { spawn } from "../lib.ts";
import * as workspaces from "../workspaces.ts";

async function up(
  {
    ask,
    template,
  }: {
    ask?: boolean;
    template?: string;
  },
  workspace?: string
) {
  await Deno.mkdir(POCKETENV_CACHE_DIR, { recursive: true });

  if (!existsSync(".terraform")) {
    await pkgx.run(`terraform init`);
  }

  const args = [];

  if (!ask) {
    args.push("-auto-approve");
  }

  await pkgx.run(`terraform apply ${args.join(" ")}`);
  const containerId = await spawn(
    "sh",
    ["-c", 'pkgx terraform output -json | pkgx jq -r ".container_id.value"'],
    "piped"
  );
  const logs = await spawn("sh", ["-c", `docker logs ${containerId}`]);
  console.log(logs);

  workspace = workspace || Deno.cwd().split("/").pop()!;
  await workspaces.save(Deno.cwd(), {
    containerId,
    name: workspace,
    path: Deno.cwd(),
    status: "RUNNING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export default up;
