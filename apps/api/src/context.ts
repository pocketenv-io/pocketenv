import { env } from "lib/env";
import { getConnection } from "./drizzle";
import { createDb, migrateToLatest } from "db";
import { createStorage } from "unstorage";
import sqliteKv from "sqliteKv";
import { createBidirectionalResolver, createIdResolver } from "lib/idResolver";
import { createClient } from "auth/client";
import { consola } from "consola";
import authVerifier from "lib/authVerfifier";
import redis from "redis";
import type { RequestHandler } from "express";
import axios from "axios";
import { workers } from "cloudflare";

const { DB_PATH } = env;
export const db = createDb(DB_PATH);
await migrateToLatest(db);

const kv = createStorage({
  driver: sqliteKv({ location: env.KV_DB_PATH, table: "kv" }),
});

const baseIdResolver = createIdResolver(kv);

export const ctx = {
  oauthClient: await createClient(db),
  resolver: createBidirectionalResolver(baseIdResolver),
  baseIdResolver,
  db: getConnection(),
  authVerifier,
  sqliteDb: db,
  sqliteKv: kv,
  redis: await redis
    .createClient({ url: env.REDIS_URL })
    .on("error", (err) => {
      consola.error("Uncaught Redis Client Error", err);
      process.exit(1);
    })
    .connect(),
  kv: new Map<string, string>(),
  sandbox: () =>
    axios.create({
      baseURL: env.SANDBOX_API_URL,
    }),
  cfsandbox: (base: string) =>
    axios.create({
      baseURL:
        base && !env.CF_LOCAL && workers[base]
          ? workers[base]
          : env.CF_SANDBOX_API_URL,
    }),
};

export const contextMiddleware: RequestHandler = (req, _res, next) => {
  req.ctx = ctx;

  next();
};

export type Context = typeof ctx;
