import { pkgx } from "../../deps.ts";

async function down({ ask }: { ask?: boolean }, workspace?: string) {
  const args = [];

  if (!ask) {
    args.push("-auto-approve");
  }

  await pkgx.run(`terraform destroy ${args.join(" ")}`, "inherit");
}

export default down;
