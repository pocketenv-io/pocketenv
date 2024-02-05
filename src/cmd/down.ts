import { pkgx, Logger } from "../../deps.ts";
import * as workspaces from "../workspaces.ts";
import { existsSync } from "node:fs";

async function down({ ask }: { ask?: boolean }, workspace?: string) {
  const logger = new Logger();
  const args = [];

  if (!ask) {
    args.push("-auto-approve");
  }

  let workdir = Deno.cwd();

  if (workspace) {
    const result = await workspaces.get(workspace);
    if (!result) {
      console.error(`Workspace ${workspace} not found.`);
      Deno.exit(1);
    }
    workdir = result.path;
  }

  if (existsSync(`${workdir}/.pocketenv`)) {
    workdir = `${workdir}/.pocketenv`;
  }

  await pkgx.run(`terraform destroy ${args.join(" ")}`, "inherit", workdir);

  const result = await workspaces.get(
    workspace || workdir.replace(/\/.pocketenv$/, "")
  );

  if (!result) {
    logger.warn("Workspace not found");
  }

  await workspaces.save(result?.path || Deno.cwd(), {
    containerId: null,
    name: result!.name,
    path: result?.path || Deno.cwd(),
    status: "Stopped",
    createdAt: result!.createdAt,
    updatedAt: new Date().toISOString(),
  });
}

export default down;
