import { Hono } from "hono";
import { Context } from "./context.ts";
import { logger } from "hono/logger";
import { consola } from "consola";
import chalk from "chalk";
import { authMiddleware } from "./middleware/auth.ts";
import { sandboxRouter } from "./routes/sandboxes.ts";

export { getSandbox, saveSecrets, saveVariables } from "./lib/sandbox-db.ts";

const app = new Hono<{ Variables: Context }>();

app.use("*", authMiddleware);
app.use(logger());

app.get("/", (c) => {
  return c.text(`
    _____                 ____
   / ___/____ _____  ____/ / /_  ____  _  __
   \\__ \\/ __ \`/ __ \\/ __  / __ \\/ __ \\| |/_/
  ___/ / /_/ / / / / /_/ / /_/ / /_/ />  <
 /____/\\__,_/_/ /_/\\__,_/_.___/\\____/_/|_|

    `);
});

app.route("/v1/sandboxes", sandboxRouter);

const PORT = 8788;

const url = chalk.greenBright(`http://localhost:${PORT}`);
consola.info(`Starting server on ${url}`);

Deno.serve({ port: PORT }, app.fetch);
