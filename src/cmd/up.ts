import { generateName, pkgx } from "../../deps.ts";
import { existsSync } from "node:fs";
import { POCKETENV_CACHE_DIR } from "../consts.ts";
import { spawn } from "../lib.ts";
import * as workspaces from "../workspaces.ts";

async function up(
  {
    ask,
    template: _template,
  }: {
    ask?: boolean;
    template?: string;
  },
  workspace?: string
) {
  await Deno.mkdir(POCKETENV_CACHE_DIR, { recursive: true });

  const args = [];

  if (!ask) {
    args.push("-auto-approve");
  }

  let workdir = Deno.cwd();
  const generatedName = generateName();

  if (workspace) {
    const result = await workspaces.get(workspace);
    if (!result) {
      console.error(`Workspace ${workspace} not found.`);
      Deno.exit(1);
    }
    workdir = result.path;
    args.push(`-var 'hostname=${result.name}'`);
    args.push(`-var 'workspace_name=${result.name}'`);
  }

  if (!workspace) {
    args.push(`-var 'hostname=${generatedName}'`);
    args.push(`-var 'workspace_name=${generatedName}'`);
  }

  if (existsSync(`${workdir}/.pocketenv`)) {
    workdir = `${workdir}/.pocketenv`;
  }

  if (!existsSync(`${workdir}/.terraform`)) {
    await pkgx.run(`terraform init`, "inherit", workdir);
  }

  await pkgx.run(`terraform apply ${args.join(" ")}`, "inherit", workdir);
  const containerId = await spawn(
    "sh",
    ["-c", 'pkgx terraform output -json | pkgx jq -r ".container_id.value"'],
    "piped",
    workdir
  );
  const logs = await spawn("sh", ["-c", `docker logs ${containerId}`]);
  console.log(logs);

  const result = await workspaces.get(workspace || Deno.cwd());

  workspace = result?.name || workspace || generatedName;
  await workspaces.save(result?.path || Deno.cwd(), {
    containerId,
    name: workspace,
    path: result?.path || Deno.cwd(),
    status: "Running",
    createdAt: result?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export default up;
