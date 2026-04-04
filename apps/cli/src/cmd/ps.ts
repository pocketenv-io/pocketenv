import { client } from "../client";
import consola from "consola";
import { env } from "../lib/env";
import getAccessToken from "../lib/getAccessToken";
import type { Sandbox } from "../types/sandbox";
import Table from "cli-table3";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Profile } from "../types/profile";
import { c } from "../theme";
dayjs.extend(relativeTime);

async function ps() {
  const token = await getAccessToken();

  const profile = await client.get<Profile>(
    "/xrpc/io.pocketenv.actor.getProfile",
    {
      headers: {
        Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
      },
    },
  );

  const response = await client.get<{ sandboxes: Sandbox[] }>(
    "/xrpc/io.pocketenv.actor.getActorSandboxes",
    {
      params: {
        did: profile.data.did,
        isRunning: true,
        offset: 0,
        limit: 100,
      },
    },
  );

  const table = new Table({
    head: [
      c.primary("NAME"),
      c.primary("BASE"),
      c.primary("STATUS"),
      c.primary("CREATED AT"),
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

  for (const sandbox of response.data.sandboxes) {
    table.push([
      c.secondary(sandbox.name),
      sandbox.baseSandbox,
      sandbox.status === "RUNNING"
        ? c.highlight(sandbox.status)
        : sandbox.status,
      dayjs(sandbox.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export default ps;
