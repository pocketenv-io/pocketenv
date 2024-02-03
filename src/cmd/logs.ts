import { pkgx } from "../../deps.ts";
import { spawn } from "../lib.ts";

async function logs({ follow }: { follow?: boolean }, workspace?: string) {
  const containerId = await spawn(
    "sh",
    ["-c", 'pkgx terraform output -json | pkgx jq -r ".container_id.value"'],
    "piped"
  );
  await pkgx.run(`docker logs ${containerId} ${follow ? "-f" : ""}`);
}

export default logs;
