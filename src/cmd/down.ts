import { pkgx, Logger } from "../../deps.ts";
import * as workspaces from "../workspaces.ts";

async function down({ ask }: { ask?: boolean }, workspace?: string) {
  const logger = new Logger();
  const args = [];

  if (!ask) {
    args.push("-auto-approve");
  }

  await pkgx.run(`terraform destroy ${args.join(" ")}`, "inherit");

  const result = await workspaces.get(Deno.cwd());

  if (!result) {
    logger.warn("Workspace not found");
  }

  await workspaces.save(Deno.cwd(), {
    containerId: result!.containerId,
    name: result!.name,
    path: Deno.cwd(),
    status: "STOPPED",
    createdAt: result!.createdAt,
    updatedAt: new Date().toISOString(),
  });
}

export default down;
