import type { Context } from "context";
import type { Server } from "lexicon";
import createSandbox from "./io/pocketenv/sandbox/createSandbox";
import deleteSandbox from "./io/pocketenv/sandbox/deleteSandbox";
import getSandbox from "./io/pocketenv/sandbox/getSandbox";
import getSandboxes from "./io/pocketenv/sandbox/getSandboxes";
import startSandbox from "./io/pocketenv/sandbox/startSandbox";
import stopSandbox from "./io/pocketenv/sandbox/stopSandbox";
import claimSandbox from "./io/pocketenv/sandbox/claimSandbox";
import getProfile from "./io/pocketenv/actor/getProfile";
import getActorSandboxes from "./io/pocketenv/actor/getActorSandboxes";
import getTerminalToken from "./io/pocketenv/actor/getTerminalToken";
import addFile from "./io/pocketenv/file/addFile";
import deleteFile from "./io/pocketenv/file/deleteFile";
import getFiles from "./io/pocketenv/file/getFiles";
import addSecret from "./io/pocketenv/secret/addSecret";
import deleteSecret from "./io/pocketenv/secret/deleteSecret";
import getSecrets from "./io/pocketenv/secret/getSecrets";
import addVolume from "./io/pocketenv/volume/addVolume";
import deleteVolume from "./io/pocketenv/volume/deleteVolume";
import getVolumes from "./io/pocketenv/volume/getVolumes";

export default function (server: Server, ctx: Context) {
  // io.pocketenv
  getSandbox(server, ctx);
  getSandboxes(server, ctx);
  getActorSandboxes(server, ctx);
  createSandbox(server, ctx);
  deleteSandbox(server, ctx);
  startSandbox(server, ctx);
  stopSandbox(server, ctx);
  claimSandbox(server, ctx);
  getProfile(server, ctx);
  getTerminalToken(server, ctx);
  addFile(server, ctx);
  deleteFile(server, ctx);
  getFiles(server, ctx);
  addSecret(server, ctx);
  deleteSecret(server, ctx);
  getSecrets(server, ctx);
  addVolume(server, ctx);
  deleteVolume(server, ctx);
  getVolumes(server, ctx);

  return server;
}
