import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/getSshKeys";

export default function (server: Server, ctx: Context) {
  const getSshKeys = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.sandbox.getSshKeys({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getSshKeys(params, auth);
      return {
        encoding: "application/json",
        body: result as any, // TODO: Implement getSshKeys
      };
    },
  });
}
