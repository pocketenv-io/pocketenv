/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  createServer as createXrpcServer,
  type Server as XrpcServer,
  type Options as XrpcOptions,
  type AuthVerifier,
  type StreamAuthVerifier,
} from "@atproto/xrpc-server";
import { schemas } from "./lexicons";
import type * as IoPocketenvActorGetActorSandboxes from "./types/io/pocketenv/actor/getActorSandboxes";
import type * as IoPocketenvActorGetProfile from "./types/io/pocketenv/actor/getProfile";
import type * as IoPocketenvActorGetTerminalToken from "./types/io/pocketenv/actor/getTerminalToken";
import type * as IoPocketenvFileAddFile from "./types/io/pocketenv/file/addFile";
import type * as IoPocketenvFileDeleteFile from "./types/io/pocketenv/file/deleteFile";
import type * as IoPocketenvFileGetFile from "./types/io/pocketenv/file/getFile";
import type * as IoPocketenvFileGetFiles from "./types/io/pocketenv/file/getFiles";
import type * as IoPocketenvFileUpdateFile from "./types/io/pocketenv/file/updateFile";
import type * as IoPocketenvSandboxClaimSandbox from "./types/io/pocketenv/sandbox/claimSandbox";
import type * as IoPocketenvSandboxCreateIntegration from "./types/io/pocketenv/sandbox/createIntegration";
import type * as IoPocketenvSandboxCreateSandbox from "./types/io/pocketenv/sandbox/createSandbox";
import type * as IoPocketenvSandboxDeleteSandbox from "./types/io/pocketenv/sandbox/deleteSandbox";
import type * as IoPocketenvSandboxExec from "./types/io/pocketenv/sandbox/exec";
import type * as IoPocketenvSandboxExposePort from "./types/io/pocketenv/sandbox/exposePort";
import type * as IoPocketenvSandboxExposeVscode from "./types/io/pocketenv/sandbox/exposeVscode";
import type * as IoPocketenvSandboxGetExposedPorts from "./types/io/pocketenv/sandbox/getExposedPorts";
import type * as IoPocketenvSandboxGetIntegrations from "./types/io/pocketenv/sandbox/getIntegrations";
import type * as IoPocketenvSandboxGetPreferences from "./types/io/pocketenv/sandbox/getPreferences";
import type * as IoPocketenvSandboxGetSandbox from "./types/io/pocketenv/sandbox/getSandbox";
import type * as IoPocketenvSandboxGetSandboxes from "./types/io/pocketenv/sandbox/getSandboxes";
import type * as IoPocketenvSandboxGetSshKeys from "./types/io/pocketenv/sandbox/getSshKeys";
import type * as IoPocketenvSandboxGetTailscaleAuthKey from "./types/io/pocketenv/sandbox/getTailscaleAuthKey";
import type * as IoPocketenvSandboxGetTailscaleToken from "./types/io/pocketenv/sandbox/getTailscaleToken";
import type * as IoPocketenvSandboxPutPreferences from "./types/io/pocketenv/sandbox/putPreferences";
import type * as IoPocketenvSandboxPutSshKeys from "./types/io/pocketenv/sandbox/putSshKeys";
import type * as IoPocketenvSandboxPutTailscaleAuthKey from "./types/io/pocketenv/sandbox/putTailscaleAuthKey";
import type * as IoPocketenvSandboxPutTailscaleToken from "./types/io/pocketenv/sandbox/putTailscaleToken";
import type * as IoPocketenvSandboxStartSandbox from "./types/io/pocketenv/sandbox/startSandbox";
import type * as IoPocketenvSandboxStopSandbox from "./types/io/pocketenv/sandbox/stopSandbox";
import type * as IoPocketenvSandboxUnexposePort from "./types/io/pocketenv/sandbox/unexposePort";
import type * as IoPocketenvSandboxUpdateSandboxSettings from "./types/io/pocketenv/sandbox/updateSandboxSettings";
import type * as IoPocketenvSecretAddSecret from "./types/io/pocketenv/secret/addSecret";
import type * as IoPocketenvSecretDeleteSecret from "./types/io/pocketenv/secret/deleteSecret";
import type * as IoPocketenvSecretGetSecret from "./types/io/pocketenv/secret/getSecret";
import type * as IoPocketenvSecretGetSecrets from "./types/io/pocketenv/secret/getSecrets";
import type * as IoPocketenvSecretUpdateSecret from "./types/io/pocketenv/secret/updateSecret";
import type * as IoPocketenvServiceAddService from "./types/io/pocketenv/service/addService";
import type * as IoPocketenvServiceDeleteService from "./types/io/pocketenv/service/deleteService";
import type * as IoPocketenvServiceGetServices from "./types/io/pocketenv/service/getServices";
import type * as IoPocketenvServiceRestartService from "./types/io/pocketenv/service/restartService";
import type * as IoPocketenvServiceUpdateService from "./types/io/pocketenv/service/updateService";
import type * as IoPocketenvVariableAddVariable from "./types/io/pocketenv/variable/addVariable";
import type * as IoPocketenvVariableDeleteVariable from "./types/io/pocketenv/variable/deleteVariable";
import type * as IoPocketenvVariableGetVariable from "./types/io/pocketenv/variable/getVariable";
import type * as IoPocketenvVariableGetVariables from "./types/io/pocketenv/variable/getVariables";
import type * as IoPocketenvVariableUpdateVariable from "./types/io/pocketenv/variable/updateVariable";
import type * as IoPocketenvVolumeAddVolume from "./types/io/pocketenv/volume/addVolume";
import type * as IoPocketenvVolumeDeleteVolume from "./types/io/pocketenv/volume/deleteVolume";
import type * as IoPocketenvVolumeGetVolume from "./types/io/pocketenv/volume/getVolume";
import type * as IoPocketenvVolumeGetVolumes from "./types/io/pocketenv/volume/getVolumes";
import type * as IoPocketenvVolumeUpdateVolume from "./types/io/pocketenv/volume/updateVolume";

export function createServer(options?: XrpcOptions): Server {
  return new Server(options);
}

export class Server {
  xrpc: XrpcServer;
  io: IoNS;
  app: AppNS;
  com: ComNS;

  constructor(options?: XrpcOptions) {
    this.xrpc = createXrpcServer(schemas, options);
    this.io = new IoNS(this);
    this.app = new AppNS(this);
    this.com = new ComNS(this);
  }
}

export class IoNS {
  _server: Server;
  pocketenv: IoPocketenvNS;

  constructor(server: Server) {
    this._server = server;
    this.pocketenv = new IoPocketenvNS(server);
  }
}

export class IoPocketenvNS {
  _server: Server;
  actor: IoPocketenvActorNS;
  file: IoPocketenvFileNS;
  sandbox: IoPocketenvSandboxNS;
  secret: IoPocketenvSecretNS;
  service: IoPocketenvServiceNS;
  variable: IoPocketenvVariableNS;
  volume: IoPocketenvVolumeNS;

  constructor(server: Server) {
    this._server = server;
    this.actor = new IoPocketenvActorNS(server);
    this.file = new IoPocketenvFileNS(server);
    this.sandbox = new IoPocketenvSandboxNS(server);
    this.secret = new IoPocketenvSecretNS(server);
    this.service = new IoPocketenvServiceNS(server);
    this.variable = new IoPocketenvVariableNS(server);
    this.volume = new IoPocketenvVolumeNS(server);
  }
}

export class IoPocketenvActorNS {
  _server: Server;

  constructor(server: Server) {
    this._server = server;
  }

  getActorSandboxes<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvActorGetActorSandboxes.Handler<ExtractAuth<AV>>,
      IoPocketenvActorGetActorSandboxes.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.actor.getActorSandboxes"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getProfile<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvActorGetProfile.Handler<ExtractAuth<AV>>,
      IoPocketenvActorGetProfile.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.actor.getProfile"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getTerminalToken<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvActorGetTerminalToken.Handler<ExtractAuth<AV>>,
      IoPocketenvActorGetTerminalToken.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.actor.getTerminalToken"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }
}

export class IoPocketenvFileNS {
  _server: Server;

  constructor(server: Server) {
    this._server = server;
  }

  addFile<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvFileAddFile.Handler<ExtractAuth<AV>>,
      IoPocketenvFileAddFile.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.file.addFile"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  deleteFile<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvFileDeleteFile.Handler<ExtractAuth<AV>>,
      IoPocketenvFileDeleteFile.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.file.deleteFile"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getFile<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvFileGetFile.Handler<ExtractAuth<AV>>,
      IoPocketenvFileGetFile.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.file.getFile"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getFiles<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvFileGetFiles.Handler<ExtractAuth<AV>>,
      IoPocketenvFileGetFiles.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.file.getFiles"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  updateFile<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvFileUpdateFile.Handler<ExtractAuth<AV>>,
      IoPocketenvFileUpdateFile.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.file.updateFile"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }
}

export class IoPocketenvSandboxNS {
  _server: Server;

  constructor(server: Server) {
    this._server = server;
  }

  claimSandbox<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxClaimSandbox.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxClaimSandbox.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.claimSandbox"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  createIntegration<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxCreateIntegration.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxCreateIntegration.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.createIntegration"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  createSandbox<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxCreateSandbox.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxCreateSandbox.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.createSandbox"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  deleteSandbox<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxDeleteSandbox.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxDeleteSandbox.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.deleteSandbox"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  exec<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxExec.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxExec.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.exec"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  exposePort<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxExposePort.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxExposePort.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.exposePort"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  exposeVscode<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxExposeVscode.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxExposeVscode.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.exposeVscode"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getExposedPorts<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxGetExposedPorts.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxGetExposedPorts.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.getExposedPorts"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getIntegrations<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxGetIntegrations.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxGetIntegrations.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.getIntegrations"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getPreferences<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxGetPreferences.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxGetPreferences.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.getPreferences"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getSandbox<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxGetSandbox.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxGetSandbox.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.getSandbox"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getSandboxes<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxGetSandboxes.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxGetSandboxes.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.getSandboxes"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getSshKeys<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxGetSshKeys.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxGetSshKeys.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.getSshKeys"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getTailscaleAuthKey<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxGetTailscaleAuthKey.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxGetTailscaleAuthKey.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.getTailscaleAuthKey"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getTailscaleToken<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxGetTailscaleToken.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxGetTailscaleToken.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.getTailscaleToken"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  putPreferences<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxPutPreferences.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxPutPreferences.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.putPreferences"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  putSshKeys<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxPutSshKeys.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxPutSshKeys.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.putSshKeys"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  putTailscaleAuthKey<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxPutTailscaleAuthKey.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxPutTailscaleAuthKey.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.putTailscaleAuthKey"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  putTailscaleToken<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxPutTailscaleToken.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxPutTailscaleToken.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.putTailscaleToken"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  startSandbox<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxStartSandbox.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxStartSandbox.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.startSandbox"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  stopSandbox<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxStopSandbox.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxStopSandbox.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.stopSandbox"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  unexposePort<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxUnexposePort.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxUnexposePort.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.unexposePort"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  updateSandboxSettings<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSandboxUpdateSandboxSettings.Handler<ExtractAuth<AV>>,
      IoPocketenvSandboxUpdateSandboxSettings.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.sandbox.updateSandboxSettings"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }
}

export class IoPocketenvSecretNS {
  _server: Server;

  constructor(server: Server) {
    this._server = server;
  }

  addSecret<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSecretAddSecret.Handler<ExtractAuth<AV>>,
      IoPocketenvSecretAddSecret.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.secret.addSecret"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  deleteSecret<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSecretDeleteSecret.Handler<ExtractAuth<AV>>,
      IoPocketenvSecretDeleteSecret.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.secret.deleteSecret"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getSecret<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSecretGetSecret.Handler<ExtractAuth<AV>>,
      IoPocketenvSecretGetSecret.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.secret.getSecret"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getSecrets<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSecretGetSecrets.Handler<ExtractAuth<AV>>,
      IoPocketenvSecretGetSecrets.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.secret.getSecrets"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  updateSecret<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvSecretUpdateSecret.Handler<ExtractAuth<AV>>,
      IoPocketenvSecretUpdateSecret.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.secret.updateSecret"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }
}

export class IoPocketenvServiceNS {
  _server: Server;

  constructor(server: Server) {
    this._server = server;
  }

  addService<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvServiceAddService.Handler<ExtractAuth<AV>>,
      IoPocketenvServiceAddService.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.service.addService"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  deleteService<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvServiceDeleteService.Handler<ExtractAuth<AV>>,
      IoPocketenvServiceDeleteService.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.service.deleteService"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getServices<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvServiceGetServices.Handler<ExtractAuth<AV>>,
      IoPocketenvServiceGetServices.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.service.getServices"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  restartService<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvServiceRestartService.Handler<ExtractAuth<AV>>,
      IoPocketenvServiceRestartService.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.service.restartService"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  updateService<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvServiceUpdateService.Handler<ExtractAuth<AV>>,
      IoPocketenvServiceUpdateService.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.service.updateService"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }
}

export class IoPocketenvVariableNS {
  _server: Server;

  constructor(server: Server) {
    this._server = server;
  }

  addVariable<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVariableAddVariable.Handler<ExtractAuth<AV>>,
      IoPocketenvVariableAddVariable.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.variable.addVariable"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  deleteVariable<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVariableDeleteVariable.Handler<ExtractAuth<AV>>,
      IoPocketenvVariableDeleteVariable.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.variable.deleteVariable"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getVariable<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVariableGetVariable.Handler<ExtractAuth<AV>>,
      IoPocketenvVariableGetVariable.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.variable.getVariable"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getVariables<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVariableGetVariables.Handler<ExtractAuth<AV>>,
      IoPocketenvVariableGetVariables.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.variable.getVariables"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  updateVariable<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVariableUpdateVariable.Handler<ExtractAuth<AV>>,
      IoPocketenvVariableUpdateVariable.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.variable.updateVariable"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }
}

export class IoPocketenvVolumeNS {
  _server: Server;

  constructor(server: Server) {
    this._server = server;
  }

  addVolume<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVolumeAddVolume.Handler<ExtractAuth<AV>>,
      IoPocketenvVolumeAddVolume.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.volume.addVolume"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  deleteVolume<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVolumeDeleteVolume.Handler<ExtractAuth<AV>>,
      IoPocketenvVolumeDeleteVolume.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.volume.deleteVolume"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getVolume<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVolumeGetVolume.Handler<ExtractAuth<AV>>,
      IoPocketenvVolumeGetVolume.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.volume.getVolume"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  getVolumes<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVolumeGetVolumes.Handler<ExtractAuth<AV>>,
      IoPocketenvVolumeGetVolumes.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.volume.getVolumes"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }

  updateVolume<AV extends AuthVerifier>(
    cfg: ConfigOf<
      AV,
      IoPocketenvVolumeUpdateVolume.Handler<ExtractAuth<AV>>,
      IoPocketenvVolumeUpdateVolume.HandlerReqCtx<ExtractAuth<AV>>
    >,
  ) {
    const nsid = "io.pocketenv.volume.updateVolume"; // @ts-ignore
    return this._server.xrpc.method(nsid, cfg);
  }
}

export class AppNS {
  _server: Server;
  bsky: AppBskyNS;

  constructor(server: Server) {
    this._server = server;
    this.bsky = new AppBskyNS(server);
  }
}

export class AppBskyNS {
  _server: Server;
  actor: AppBskyActorNS;

  constructor(server: Server) {
    this._server = server;
    this.actor = new AppBskyActorNS(server);
  }
}

export class AppBskyActorNS {
  _server: Server;

  constructor(server: Server) {
    this._server = server;
  }
}

export class ComNS {
  _server: Server;
  atproto: ComAtprotoNS;

  constructor(server: Server) {
    this._server = server;
    this.atproto = new ComAtprotoNS(server);
  }
}

export class ComAtprotoNS {
  _server: Server;
  repo: ComAtprotoRepoNS;

  constructor(server: Server) {
    this._server = server;
    this.repo = new ComAtprotoRepoNS(server);
  }
}

export class ComAtprotoRepoNS {
  _server: Server;

  constructor(server: Server) {
    this._server = server;
  }
}

type SharedRateLimitOpts<T> = {
  name: string;
  calcKey?: (ctx: T) => string | null;
  calcPoints?: (ctx: T) => number;
};
type RouteRateLimitOpts<T> = {
  durationMs: number;
  points: number;
  calcKey?: (ctx: T) => string | null;
  calcPoints?: (ctx: T) => number;
};
type HandlerOpts = { blobLimit?: number };
type HandlerRateLimitOpts<T> = SharedRateLimitOpts<T> | RouteRateLimitOpts<T>;
type ConfigOf<Auth, Handler, ReqCtx> =
  | Handler
  | {
      auth?: Auth;
      opts?: HandlerOpts;
      rateLimit?: HandlerRateLimitOpts<ReqCtx> | HandlerRateLimitOpts<ReqCtx>[];
      handler: Handler;
    };
type ExtractAuth<AV extends AuthVerifier | StreamAuthVerifier> = Extract<
  Awaited<ReturnType<AV>>,
  { credentials: unknown }
>;
