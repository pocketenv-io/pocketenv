import { pkgx } from "../../deps.ts";
import { existsSync } from "node:fs";
import { POCKETENV_CACHE_DIR } from "../consts.ts";

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
}

export default up;
