import SqliteDb from "better-sqlite3";
import chalk from "chalk";
import type { Context } from "context";
import {
  Kysely,
  type Migration,
  type MigrationProvider,
  Migrator,
  SqliteDialect,
} from "kysely";
import { consola } from "consola";

export type DatabaseSchema = {
  status: Status;
  auth_session: AuthSession;
  auth_state: AuthState;
};

export type Status = {
  uri: string;
  authorDid: string;
  status: string;
  createdAt: string;
  indexedAt: string;
};

export type AuthSession = {
  key: string;
  session: AuthSessionJson;
  expiresAt?: string | null;
};

export type AuthState = {
  key: string;
  state: AuthStateJson;
};

type AuthStateJson = string;

type AuthSessionJson = string;

// Migrations

const migrations: Record<string, Migration> = {};

const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations;
  },
};

migrations["001"] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable("status")
      .addColumn("uri", "varchar", (col) => col.primaryKey())
      .addColumn("authorDid", "varchar", (col) => col.notNull())
      .addColumn("status", "varchar", (col) => col.notNull())
      .addColumn("createdAt", "varchar", (col) => col.notNull())
      .addColumn("indexedAt", "varchar", (col) => col.notNull())
      .execute();
    await db.schema
      .createTable("auth_session")
      .addColumn("key", "varchar", (col) => col.primaryKey())
      .addColumn("session", "varchar", (col) => col.notNull())
      .execute();
    await db.schema
      .createTable("auth_state")
      .addColumn("key", "varchar", (col) => col.primaryKey())
      .addColumn("state", "varchar", (col) => col.notNull())
      .execute();
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable("auth_state").execute();
    await db.schema.dropTable("auth_session").execute();
    await db.schema.dropTable("status").execute();
  },
};

migrations["002"] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .alterTable("auth_session")
      .addColumn("expiresAt", "text", (col) => col.defaultTo("NULL"))
      .execute();
  },
  async down(db: Kysely<unknown>) {
    await db.schema
      .alterTable("auth_session")
      .dropColumn("expiresAt")
      .execute();
  },
};

// APIs

export const createDb = (location: string): Database => {
  return new Kysely<DatabaseSchema>({
    dialect: new SqliteDialect({
      database: new SqliteDb(location),
    }),
  });
};

export const migrateToLatest = async (db: Database) => {
  const migrator = new Migrator({ db, provider: migrationProvider });
  const { error } = await migrator.migrateToLatest();
  if (error) throw error;
};

export const updateExpiresAt = async (db: Database) => {
  // get all sessions that have expiresAt is null
  const sessions = await db.selectFrom("auth_session").selectAll().execute();
  consola.info("Found", sessions.length, "sessions to update");
  for (const session of sessions) {
    const data = JSON.parse(session.session) as {
      tokenSet: { expires_at?: string | null };
    };
    consola.info(session.key, data.tokenSet.expires_at);
    await db
      .updateTable("auth_session")
      .set({ expiresAt: data.tokenSet.expires_at })
      .where("key", "=", session.key)
      .execute();
  }

  consola.info(`Updated ${chalk.greenBright(sessions.length)} sessions`);
};

export type Database = Kysely<DatabaseSchema>;
