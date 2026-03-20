import chalk from "chalk";
import { client } from "../client";
import { env } from "../lib/env";
import getAccessToken from "../lib/getAccessToken";
import type { Port } from "../types/port";
import CliTable3 from "cli-table3";
import consola from "consola";
import { c } from "../theme";

export async function listPorts(sandbox: string) {
  const token = await getAccessToken();

  const response = await client.get<{ ports: Port[] }>(
    "/xrpc/io.pocketenv.sandbox.getExposedPorts",
    {
      params: {
        id: sandbox,
      },
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );

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

  for (const port of response.data.ports) {
    table.push([
      c.secondary(port.port),
      port.description || "-",
      c.link(port.previewUrl || "-"),
    ]);
  }

  consola.log(table.toString());
}
