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
import type * as IoPocketenvSandboxClaimSandbox from "./types/io/pocketenv/sandbox/claimSandbox";
import type * as IoPocketenvSandboxCreateSandbox from "./types/io/pocketenv/sandbox/createSandbox";
import type * as IoPocketenvSandboxDeleteSandbox from "./types/io/pocketenv/sandbox/deleteSandbox";
import type * as IoPocketenvSandboxGetSandbox from "./types/io/pocketenv/sandbox/getSandbox";
import type * as IoPocketenvSandboxGetSandboxes from "./types/io/pocketenv/sandbox/getSandboxes";
import type * as IoPocketenvSandboxStartSandbox from "./types/io/pocketenv/sandbox/startSandbox";
import type * as IoPocketenvSandboxStopSandbox from "./types/io/pocketenv/sandbox/stopSandbox";

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
  sandbox: IoPocketenvSandboxNS;

  constructor(server: Server) {
    this._server = server;
    this.actor = new IoPocketenvActorNS(server);
    this.sandbox = new IoPocketenvSandboxNS(server);
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
