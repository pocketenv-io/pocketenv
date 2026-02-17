import { type Agent, AtpAgent } from "@atproto/api";
import { consola } from "consola";
import type { OutputSchema } from "@atproto/api/dist/client/types/com/atproto/repo/getRecord";
import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import { Effect, pipe } from "effect";
import type { Server } from "lexicon";
import type { ProfileViewDetailed } from "lexicon/types/io/pocketenv/actor/defs";
import type { QueryParams } from "lexicon/types/io/pocketenv/actor/getProfile";
import { createAgent } from "lib/agent";
import _ from "lodash";
import tables from "schema";
import type { SelectUser } from "schema/users";

export default function (server: Server, ctx: Context) {
  const getActorProfile = (params: QueryParams, auth: HandlerAuth) =>
    pipe(
      { params, ctx, did: auth.credentials?.did },
      resolveHandleToDid,
      Effect.flatMap(withServiceEndpoint),
      Effect.flatMap(withAgent),
      Effect.flatMap(withUser),
      Effect.flatMap(retrieveProfile),
      Effect.flatMap(refreshProfile),
      Effect.flatMap(presentation),
      Effect.retry({ times: 3 }),
      Effect.timeout("120 seconds"),
      Effect.catchAll((err) => {
        consola.error(err);
        return Effect.succeed({} as ProfileViewDetailed);
      }),
    );
  server.io.pocketenv.actor.getProfile({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getActorProfile(params, auth));
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}

const resolveHandleToDid = ({
  params,
  ctx,
  did,
}: {
  params: QueryParams;
  ctx: Context;
  did?: string;
}): Effect.Effect<
  { did?: string; ctx: Context; params: QueryParams },
  Error
> => {
  return Effect.tryPromise({
    try: async () => {
      if (!params.did?.startsWith("did:plc:") && !!params.did) {
        return {
          did: await ctx.baseIdResolver.handle.resolve(params.did),
          ctx,
          params: {
            did: await ctx.baseIdResolver.handle.resolve(params.did),
          },
        };
      }
      return {
        did: params.did || did,
        ctx,
        params,
      };
    },
    catch: (error) => new Error(`Failed to resolve handle to DID: ${error}`),
  });
};

const withServiceEndpoint = ({
  params,
  ctx,
  did,
}: {
  params: QueryParams;
  ctx: Context;
  did?: string;
}): Effect.Effect<WithServiceEndpoint, Error> => {
  return Effect.tryPromise({
    try: async () => {
      if (params.did) {
        return fetch(`https://plc.directory/${params.did}`)
          .then((res) => res.json())
          .then((data) => ({
            did,
            serviceEndpoint: _.get(data, "service.0.serviceEndpoint"),
            ctx,
            params,
          }));
      }
      return {
        did,
        ctx,
        params,
      };
    },
    catch: (error) => new Error(`Failed to get service endpoint: ${error}`),
  });
};

const withAgent = ({
  params,
  ctx,
  did,
  serviceEndpoint,
}: WithServiceEndpoint): Effect.Effect<WithAgent, Error> =>
  Effect.tryPromise({
    try: async () => {
      return {
        ctx,
        did,
        params,
        agent: serviceEndpoint
          ? new AtpAgent({ service: serviceEndpoint })
          : await createAgent(ctx.oauthClient, did!),
      };
    },
    catch: (error) => new Error(`Failed to create agent: ${error}`),
  });

const withUser = ({
  params,
  ctx,
  did,
  agent,
}: WithAgent): Effect.Effect<WithUser, Error> => {
  return Effect.tryPromise({
    try: async () => {
      consola.info(">> did", did);
      return ctx.db
        .select()
        .from(tables.users)
        .where(eq(tables.users.did, did!))
        .execute()
        .then((users) => ({
          user: users[0],
          ctx,
          params,
          did,
          agent,
        }));
    },
    catch: (error) => new Error(`Failed to retrieve current user: ${error}`),
  });
};

const retrieveProfile = ({
  ctx,
  did,
  agent,
  user,
}: WithUser): Effect.Effect<[Profile, string], Error> => {
  return Effect.tryPromise({
    try: async () => {
      let record: OutputSchema | null = null;
      try {
        const { data } = await agent!.com.atproto.repo.getRecord({
          repo: did!,
          collection: "app.bsky.actor.profile",
          rkey: "self",
        });
        record = data;
      } catch (error) {
        consola.error("Failed to retrieve profile record:", error);
      }
      if (!record) {
        throw new Error("Profile record not found");
      }

      const resolvedDid = did!;
      const handle = await ctx.resolver.resolveDidToHandle(resolvedDid);
      return [
        {
          profileRecord: record,
          ctx,
          did: resolvedDid,
          user,
        },
        handle,
      ] as [Profile, string];
    },
    catch: (error) => new Error(`Failed to retrieve profile: ${error}`),
  });
};

const refreshProfile = ([profile, handle]: [Profile, string]): Effect.Effect<
  [Profile, string],
  Error
> => {
  return Effect.tryPromise({
    try: async (): Promise<[Profile, string]> => {
      if (!profile.user) {
        await profile.ctx.db
          .insert(tables.users)
          .values({
            did: profile.did,
            handle,
            avatar: `https://cdn.bsky.app/img/avatar/plain/${profile.did}/${_.get(profile, "profileRecord.value.avatar.ref", "").toString()}@jpeg`,
            displayName: _.get(profile, "profileRecord.value.displayName", ""),
          })
          .execute();
        const users = await profile.ctx.db
          .select()
          .from(tables.users)
          .where(eq(tables.users.did, profile.did))
          .execute();
        profile.user = users[0];
      } else {
        // Update existing user in background if handle or avatar or displayName changed
        if (
          profile.user.handle !== handle ||
          profile.user.avatar !==
            `https://cdn.bsky.app/img/avatar/plain/${profile.did}/${_.get(profile, "profileRecord.value.avatar.ref", "").toString()}@jpeg` ||
          profile.user.displayName !==
            _.get(profile, "profileRecord.value.displayName")
        ) {
          profile.ctx.db
            .update(tables.users)
            .set({
              handle,
              avatar: `https://cdn.bsky.app/img/avatar/plain/${profile.did}/${_.get(profile, "profileRecord.value.avatar.ref", "").toString()}@jpeg`,
              displayName: _.get(
                profile,
                "profileRecord.value.displayName",
                "",
              ),
              updatedAt: new Date(),
            })
            .where(eq(tables.users.id, profile.user.id))
            .execute();
        }
      }

      return [profile, handle] as [Profile, string];
    },
    catch: (error) => new Error(`Failed to refresh profile: ${error}`),
  });
};

const presentation = ([profile, handle]: [Profile, string]): Effect.Effect<
  ProfileViewDetailed,
  never
> => {
  return Effect.sync(() => ({
    id: profile.user?.id,
    did: profile.did,
    handle,
    displayName: _.get(profile, "profileRecord.value.displayName"),
    avatar: `https://cdn.bsky.app/img/avatar/plain/${profile.did}/${_.get(profile, "profileRecord.value.avatar.ref", "").toString()}@jpeg`,
    createdAt: profile.user?.createdAt.toISOString(),
    updatedAt: profile.user?.updatedAt.toISOString(),
  }));
};

type Profile = {
  profileRecord: OutputSchema;
  ctx: Context;
  did: string;
  user?: SelectUser;
};

type WithServiceEndpoint = {
  params: QueryParams;
  ctx: Context;
  did?: string;
  serviceEndpoint?: string;
};

type WithAgent = {
  ctx: Context;
  did?: string;
  params: QueryParams;
  agent: Agent | AtpAgent | null;
};

type WithUser = {
  user?: SelectUser;
  ctx: Context;
  params: QueryParams;
  did?: string;
  agent: Agent | AtpAgent | null;
};
