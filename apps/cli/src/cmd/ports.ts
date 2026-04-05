import { Sandbox } from "@pocketenv/sdk";
import CliTable3 from "cli-table3";
import consola from "consola";
import { c } from "../theme";
import { configureSdk } from "../lib/sdk";

export async function listPorts(sandboxName: string) {
  await configureSdk();

  const sandbox = await Sandbox.get(sandboxName);
  const ports = await sandbox.ports.list();

  const table = new CliTable3({
    head: [
      c.primary("PORT"),
      c.primary("DESCRIPTION"),
      c.primary("PREVIEW URL"),
    ],
    chars: {
      top: "",
      "top-mid": "",
      "top-left": "",
      "top-right": "",
      bottom: "",
      "bottom-mid": "",
      "bottom-left": "",
      "bottom-right": "",
      left: "",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      right: "",
      "right-mid": "",
      middle: " ",
    },
    style: {
      border: [],
      head: [],
    },
  });

  for (const port of ports) {
    table.push([
      c.secondary(port.port),
      port.description || "-",
      c.link(port.previewUrl || "-"),
    ]);
  }

  consola.log(table.toString());
}
