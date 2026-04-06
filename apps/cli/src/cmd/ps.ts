import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import Table from "cli-table3";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { c } from "../theme";
import { configureSdk } from "../lib/sdk";

dayjs.extend(relativeTime);

async function ps() {
  await configureSdk();
  const { sandboxes } = await Sandbox.list({ limit: 100, offset: 0, isRunning: true });

  const table = new Table({
    head: [
      c.primary("NAME"),
      c.primary("BASE"),
      c.primary("PROVIDER"),
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

  for (const sandbox of sandboxes) {
    table.push([
      c.secondary(sandbox.name),
      sandbox.baseSandbox ?? "",
      sandbox.provider,
      c.highlight(
        `Up ${dayjs(sandbox.startedAt).fromNow().replace("ago", "")}`,
      ),
      dayjs(sandbox.createdAt).fromNow(),
    ]);
  }

  consola.log(table.toString());
}

export default ps;
