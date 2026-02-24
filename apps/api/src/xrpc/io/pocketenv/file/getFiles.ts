import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/file/getFiles";

export default function (server: Server, ctx: Context) {
  const getFiles = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.file.getFiles({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getFiles(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
