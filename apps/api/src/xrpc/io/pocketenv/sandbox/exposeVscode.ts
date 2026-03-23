import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { updateSandbox } from "atproto/sandbox";
import { consola } from "consola";
import { Providers, VSCODE_PORT } from "consts";
import type { Context } from "context";
import { and, eq, isNull, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/sandbox/exposeVscode";
import { createAgent } from "lib/agent";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const exposeVscode = async (params: QueryParams, auth: HandlerAuth) => {
    return ctx.db.transaction(async (tx) => {
      const [record] = await tx
        .select()
        .from(schema.sandboxes)
        .leftJoin(schema.users, eq(schema.sandboxes.userId, schema.users.id))
        .where(
          and(
            or(
              eq(schema.sandboxes.id, params.id),
              eq(schema.sandboxes.uri, params.id),
              eq(schema.sandboxes.name, params.id),
            ),
            auth.credentials
              ? eq(schema.users.did, auth.credentials.did)
              : isNull(schema.sandboxes.userId),
          ),
        )
        .execute();

      if (!record) {
        throw new XRPCError(404, "Sandbox not found");
      }

      const existingPort = await tx
        .select()
        .from(schema.sandboxPorts)
        .where(
          and(
            eq(schema.sandboxPorts.sandboxId, record.sandboxes.id),
            eq(schema.sandboxPorts.exposedPort, VSCODE_PORT),
          ),
        )
        .execute();

      if (existingPort.length > 0) {
        return existingPort[0]!.previewUrl || "";
      }

      await tx
        .insert(schema.sandboxPorts)
        .values({
          sandboxId: record.sandboxes.id,
          exposedPort: VSCODE_PORT,
          description: "VS Code Server",
        })
        .execute();

      const records = await tx
        .select()
        .from(schema.sandboxPorts)
        .where(eq(schema.sandboxPorts.sandboxId, record.sandboxes.id))
        .execute();

      const ports = records.map((r) => r.exposedPort);

      if (record.sandboxes.uri) {
        if (!auth.credentials) {
          throw new XRPCError(401, "Unauthorized");
        }

        const agent = await createAgent(ctx.oauthClient, auth.credentials.did);
        if (!agent) {
          consola.error(
            "Failed to create AT Protocol agent for DID:",
            auth.credentials.did,
          );
          throw new XRPCError(
            500,
            "Failed to create AT Protocol agent",
            "AgentCreationError",
          );
        }

        updateSandbox(agent, {
          rkey: record.sandboxes.uri.split("/").pop()!,
          ports,
        }).catch((err) => {
          consola.error("Failed to update sandbox with new ports:", err);
        });
      }

      const sandbox =
        record.sandboxes.provider === Providers.CLOUDFLARE
          ? ctx.cfsandbox(record.sandboxes.base!)
          : ctx.sandbox();

      const { data } = await sandbox.post<{ previewUrl: string }>(
        `/v1/sandboxes/${record.sandboxes.id}/vscode`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
          },
        },
      );

      if (data.previewUrl) {
        const updated = await ctx.db
          .update(schema.sandboxPorts)
          .set({ previewUrl: data.previewUrl })
          .where(
            and(
              eq(schema.sandboxPorts.sandboxId, record.sandboxes.id),
              eq(schema.sandboxPorts.exposedPort, VSCODE_PORT),
            ),
          )
          .returning()
          .execute();

        if (updated.length === 0) {
          await ctx.db
            .insert(schema.sandboxPorts)
            .values({
              sandboxId: record.sandboxes.id,
              exposedPort: VSCODE_PORT,
              previewUrl: data.previewUrl,
              description: "VS Code Server",
            })
            .execute();
        }
      }

      return data.previewUrl;
    });
  };
  server.io.pocketenv.sandbox.exposeVscode({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const previewUrl = await exposeVscode(params, auth);
      return {
        encoding: "application/json",
        body: { previewUrl } satisfies OutputSchema,
      };
    },
  });
}
