import { and, inArray, isNull, lt } from "drizzle-orm";
import { getConnection } from "./drizzle.ts";
import sandboxes from "./schema/sandboxes.ts";
import sandboxPorts from "./schema/sandbox-ports.ts";
import consola from "consola";
import chalk from "chalk";
import { workers } from "./workers.ts";

const db = getConnection();
const API_BASE = `http://localhost:${Deno.env.get("PORT") ?? 8788}`;
const CONCURRENCY = 5;

async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const settled = await Promise.allSettled(
      tasks.slice(i, i + limit).map((t) => t()),
    );
    results.push(...settled);
  }
  return results;
}

Deno.cron("clean-uninitialized-sandboxes", "*/5 * * * *", async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const stale = await db
    .select({ id: sandboxes.id })
    .from(sandboxes)
    .where(
      and(
        isNull(sandboxes.uri),
        lt(sandboxes.createdAt, cutoff),
        isNull(sandboxes.userId),
      ),
    )
    .execute();

  if (stale.length === 0) return;

  await withConcurrency(
    stale.map(
      ({ id }) =>
        () =>
          fetch(`${API_BASE}/v1/sandboxes/${id}/stop`, { method: "POST" }),
    ),
    CONCURRENCY,
  ).catch(() => {
    consola.warn(
      "Failed to stop some uninitialized sandboxes. They may have already been stopped or deleted.",
    );
  });

  await withConcurrency(
    stale.flatMap(({ id }) =>
      Object.values(workers).map(
        (worker) => () =>
          fetch(`${worker}/v1/sandboxes/${id}/stop`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }),
      ),
    ),
    CONCURRENCY,
  ).catch(() => {
    consola.warn(
      "Failed to stop some uninitialized sandboxes on workers. They may have already been stopped or deleted.",
    );
  });

  const staleIds = stale.map(({ id }) => id);

  await db
    .delete(sandboxPorts)
    .where(inArray(sandboxPorts.sandboxId, staleIds))
    .execute();

  const deleted = await db
    .delete(sandboxes)
    .where(and(isNull(sandboxes.uri), lt(sandboxes.createdAt, cutoff)))
    .returning({ id: sandboxes.id })
    .execute();

  consola.success(
    `Cleaned ${chalk.greenBright(deleted.length)} uninitialized sandbox(es)`,
  );
});
