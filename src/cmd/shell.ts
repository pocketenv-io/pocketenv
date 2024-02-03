import { pkgx } from "../../deps.ts";
import { spawn } from "../lib.ts";

async function shell(workspace?: string) {
  const containerId = await spawn(
    "sh",
    ["-c", 'pkgx terraform output -json | pkgx jq -r ".container_id.value"'],
    "piped"
  );
  await pkgx.run(`docker exec -it ${containerId} bash`);
}

export default shell;
