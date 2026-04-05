import { Hono } from "hono";
import { cors } from "hono/cors";
import { Context } from "./context";
import { proxyToSandbox, Sandbox } from "@cloudflare/sandbox";
import { authMiddleware } from "./middleware/auth";
import { cpRoutes } from "./routes/cp";
import { sandboxRoutes } from "./routes/sandboxes";
import { terminalRoutes } from "./routes/terminal";

export { saveSecrets, saveVariables, getSandboxRecord as getSandboxById } from "./lib/sandbox-helpers";

type Bindings = {
  Sandbox: DurableObjectNamespace<Sandbox<Env>>;
};

const app = new Hono<{ Variables: Context; Bindings: Bindings }>();

app.use(cors());

app.use("*", async (c, next) => {
  const proxyResponse = await proxyToSandbox(c.req.raw, c.env);
  if (proxyResponse) return proxyResponse;
  await next();
});

app.use("*", authMiddleware);

app.get("/", (c) =>
  c.text(`
    _____                 ____
   / ___/____ _____  ____/ / /_  ____  _  __
   \\__ \\/ __ \`/ __ \\/ __  / __ \\/ __ \\| |/_/
  ___/ / /_/ / / / / /_/ / /_/ / /_/ />  <
 /____/\\__,_/_/ /_/\\__,_/_.___/\\____/_/|_|

    `),
);

app.route("/", cpRoutes);
app.route("/", sandboxRoutes);
app.route("/", terminalRoutes);

export { Sandbox } from "@cloudflare/sandbox";

export default app;
