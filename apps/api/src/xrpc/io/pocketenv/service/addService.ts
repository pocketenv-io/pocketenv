import type { Server } from "lexicon";
import type { Context } from "context";
import type {
  HandlerInput,
  QueryParams,
} from "lexicon/types/io/pocketenv/service/addService";
import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import schema from "schema";
import type { InsertService } from "schema/services";
import { consola } from "consola";
import type { InsertSandboxPort } from "schema/sandbox-ports";
import { and, eq, or } from "drizzle-orm";
import { Providers } from "consts";
import generateJwt from "lib/generateJwt";

export default function (server: Server, ctx: Context) {
  const addService = async (
    input: HandlerInput,
    params: QueryParams,
    auth: HandlerAuth,
  ) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const [record] = await ctx.db
      .select()
      .from(schema.sandboxes)
      .leftJoin(schema.users, eq(schema.users.id, schema.sandboxes.userId))
      .where(
        and(
          or(
            eq(schema.sandboxes.id, params.sandboxId),
            eq(schema.sandboxes.name, params.sandboxId),
            eq(schema.sandboxes.uri, params.sandboxId),
          ),
          eq(schema.users.did, auth.credentials.did),
        ),
      )
      .execute()
      .then((results) => results.map(({ sandboxes }) => sandboxes));

    if (!record) {
      consola.error("Sandbox not found for service", { input, params, auth });
      throw new XRPCError(404, "Sandbox not found");
    }

    const service = await ctx.db.transaction(async (tx) => {
      const [service] = await tx
        .insert(schema.services)
        .values({
          sandboxId: record.id,
          name: input.body.service.name,
          description: input.body.service.description,
          command: input.body.service.command,
        } satisfies InsertService)
        .returning()
        .execute();

      if (!service) {
        consola.error("Failed to create service", { input, params, auth });
        throw new XRPCError(500, "Failed to create service");
      }

      await Promise.all(
        (input.body.service.ports || []).map((port) =>
          tx
            .insert(schema.sandboxPorts)
            .values({
              sandboxId: record.id,
              serviceId: service.id,
              exposedPort: port,
              description: `Port ${port} for service ${service.name}`,
            } satisfies InsertSandboxPort)
            .execute(),
        ),
      );

      return service;
    });

    if (record.status !== "RUNNING") {
      consola.info("Sandbox is not running, skipping service start", {
        sandboxId: record.id,
        serviceId: service.id,
        status: record.status,
      });
      return;
    }

    // start service
    const sandbox =
      record.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record.base!)
        : ctx.sandbox(record?.provider);

    await sandbox.post(
      `/v1/sandboxes/${record.id}/services/${service.id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
        },
      },
    );

    // expose service ports
    const responses = await Promise.all(
      (input.body.service.ports || []).map(async (port) =>
        sandbox.post<{ previewUrl: string }>(
          `/v1/sandboxes/${record.id}/ports`,
          {
            port,
          },
          {
            headers: {
              Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
            },
          },
        ),
      ),
    );

    responses.map(async ({ data }, index) => {
      if (data.previewUrl) {
        await ctx.db
          .update(schema.sandboxPorts)
          .set({ previewUrl: data.previewUrl })
          .where(
            and(
              eq(schema.sandboxPorts.sandboxId, record.id),
              eq(
                schema.sandboxPorts.exposedPort,
                input.body.service.ports![index]!,
              ),
            ),
          )
          .execute();
      }
    });
  };

  server.io.pocketenv.service.addService({
    auth: ctx.authVerifier,
    handler: async ({ input, params, auth }) => {
      await addService(input, params, auth);
    },
  });
}
