import type { Context } from "context";
import type { Server } from "lexicon";
import createSandbox from "./io/pocketenv/sandbox/createSandbox";
import deleteSandbox from "./io/pocketenv/sandbox/deleteSandbox";
import getSandbox from "./io/pocketenv/sandbox/getSandbox";
import getSandboxes from "./io/pocketenv/sandbox/getSandboxes";
import startSandbox from "./io/pocketenv/sandbox/startSandbox";
import stopSandbox from "./io/pocketenv/sandbox/stopSandbox";

export default function (server: Server, ctx: Context) {
  // io.pocketenv
  createSandbox(server, ctx);
  deleteSandbox(server, ctx);
  getSandbox(server, ctx);
  getSandboxes(server, ctx);
  startSandbox(server, ctx);
  stopSandbox(server, ctx);

  return server;
}
