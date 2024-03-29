import { pkgx } from "../../deps.ts";
import { spawn } from "../lib.ts";
import { existsSync } from "node:fs";
import * as workspaces from "../workspaces.ts";

async function shell(workspace?: string) {
  let workdir = Deno.cwd();

  if (workspace) {
    const result = await workspaces.get(workspace);
    if (!result) {
      console.error(`🚨 Workspace ${workspace} not found.`);
      Deno.exit(1);
    }
    workdir = result.path;
  }

  if (existsSync(`${workdir}/.pocketenv`)) {
    workdir = `${workdir}/.pocketenv`;
  }

  const containerId = await spawn(
    "sh",
    ["-c", 'pkgx terraform output -json | pkgx jq -r ".container_id.value"'],
    "piped",
    workdir
  );
  await pkgx.run(`docker exec -it ${containerId} bash`);
}

export default shell;
