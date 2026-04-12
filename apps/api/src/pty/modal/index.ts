import type { Context, Session } from "context";
import { eq, or } from "drizzle-orm";
import schema from "schema";
import { consola } from "consola";
import { ContainerProcess, ModalClient, Sandbox } from "modal";
import decrypt from "lib/decrypt";
import { createListener } from "pty/pty-tunnel";
import chalk from "chalk";
import { $ } from "zx";
import crypto from "crypto";
import fs from "fs/promises";
import path from "node:path";

const TERM = "xterm-256color";
const PTY_SERVER_DOWNLOAD_URL =
  "https://github.com/tsirysndr/pty-tunnel-server/releases/download/v0.0.2/pty-server-linux-x86_64.tar.gz";
const SERVER_BIN_NAME = "pty-tunnel-server";
const PTY_PORT = 26661;

type SandboxEnvironmentOptions = {
  id: string;
  tokenId: string;
  tokenSecret: string;
};

async function checkIfServerInstalled(sandbox: Sandbox) {
  const exists = await sandbox.exec(["command", "-v", SERVER_BIN_NAME]);
  const exitCode = await exists.wait();
  return exitCode === 0;
}

async function setupSandboxEnvironment(
  options: SandboxEnvironmentOptions,
): Promise<{ sandbox: Sandbox; cmd: ContainerProcess<string> }> {
  const modal = new ModalClient({
    tokenId: options.tokenId,
    tokenSecret: options.tokenSecret,
  });
  consola.info("Modal: fetching sandbox", chalk.greenBright(options.id));
  const sandbox = await modal.sandboxes.fromId(options.id);
  consola.info("Modal: sandbox fetched", chalk.greenBright(options.id));

  consola.info("Modal: checking pty-tunnel-server", chalk.greenBright(options.id));
  if (!(await checkIfServerInstalled(sandbox))) {
    await $`bash -c "type /tmp/${SERVER_BIN_NAME} || curl -L ${PTY_SERVER_DOWNLOAD_URL} | tar xz -C /tmp"`;

    consola.info(
      "Uploading pty-tunnel server binary to sandbox",
      chalk.greenBright(options.id),
    );

    const pathname = path.join("/tmp", `pty-server-${crypto.randomUUID()}`);
    const bin = await sandbox.open(pathname, "w");
    await bin.write(await fs.readFile(`/tmp/${SERVER_BIN_NAME}`));
    await bin.close();

    consola.info(
      "Setting up pty-tunnel server binary in sandbox",
      chalk.greenBright(options.id),
    );

    await sandbox.exec([
      "bash",
      "-c",
      `mv "${pathname}" /usr/local/bin/${SERVER_BIN_NAME} || sudo mv "${pathname}" /usr/local/bin/${SERVER_BIN_NAME}; chmod a+x /usr/local/bin/${SERVER_BIN_NAME} || sudo chmod a+x /usr/local/bin/${SERVER_BIN_NAME}`,
    ]);

    consola.info(
      "Pty-tunnel server binary set up in sandbox",
      chalk.greenBright(options.id),
    );
  }

  consola.info(
    "Starting pty-tunnel server in sandbox",
    chalk.greenBright(options.id),
  );

  const cmd = await sandbox.exec(
    [
      SERVER_BIN_NAME,
      `--port=${PTY_PORT}`,
      `--mode=client`,
      `--cols=${process.stdout.columns ?? 80}`,
      `--rows=${process.stdout.rows ?? 24}`,
      "bash",
    ],
    {
      env: {
        TERM,
      },
    },
  );

  consola.info("Modal: pty-tunnel-server process started", chalk.greenBright(options.id));

  return { sandbox, cmd };
}

export async function createTerminalSession(ctx: Context, id: string) {
  const [record] = await ctx.db
    .select()
    .from(schema.sandboxes)
    .leftJoin(
      schema.modalAuth,
      eq(schema.modalAuth.sandboxId, schema.sandboxes.id),
    )
    .where(or(eq(schema.sandboxes.id, id), eq(schema.sandboxes.sandboxId, id)))
    .execute();

  if (!record?.modal_auth) {
    consola.error("Modal auth not found for sandbox", { id });
    throw new Error("Modal auth not found for sandbox " + id);
  }

  if (!record.sandboxes.sandboxId) {
    consola.error("Sandbox ID not found for sandbox", { id });
    throw new Error("Sandbox ID not found for sandbox " + id);
  }

  // setup the sandbox environment for pty-tunnel server
  const { sandbox, cmd } = await setupSandboxEnvironment({
    id: record.sandboxes.sandboxId,
    tokenId: decrypt(record.modal_auth.tokenId),
    tokenSecret: decrypt(record.modal_auth.tokenSecret),
  });

  const listener = createListener();

  // Log stderr without piping to the listener.
  (async () => {
    for await (const data of cmd.stderr) {
      consola.debug(`pty-tunnel-server [stderr]:`, data.trimEnd());
    }
  })().catch(() => {});

  // Pipe the pty-tunnel-server's stdout into the listener so
  // readConnectionInfo() can parse the JSON connection handshake.
  // We also accept stderr in case the binary writes there instead.
  (async () => {
    for await (const data of cmd.stdout) {
      consola.debug(`pty-tunnel-server [stdout]:`, data.trimEnd());
      // jsonlines parser requires newline-terminated data
      const chunk = data.endsWith("\n") ? data : data + "\n";
      listener.stdoutStream.write(chunk);
    }
    listener.stdoutStream.end();
  })().catch((err) =>
    consola.error("pty-tunnel-server log stream error:", err),
  );

  consola.info("Modal: fetching sandbox tunnels", chalk.greenBright(id));
  const tunnels = await sandbox.tunnels();
  consola.info("Modal: tunnels fetched", JSON.stringify(Object.keys(tunnels)));
  const port = tunnels[PTY_PORT];
  if (!port) {
    consola.error(`PTY port ${PTY_PORT} not found in sandbox tunnels`, {
      id,
      tunnels,
    });
    throw new Error(`PTY port ${PTY_PORT} not found in sandbox tunnels`);
  }

  consola.info("Modal: awaiting pty-tunnel connection info", chalk.greenBright(id));
  const details = await listener.connection;
  consola.info("Modal: pty-tunnel connection info received", chalk.greenBright(id));

  const url = `wss://${port.url.replace(/^https?:\/\//, "")}` as const;
  consola.info("Connecting to WebSocket URL:", url);

  const socket = details.createClient(url);

  const session: Session = {
    socket,
    clients: new Set(),
    wsClients: new Set(),
  };

  socket.addEventListener("message", async ({ data }) => {
    const text = data.toString("utf-8");
    for (const res of session.clients) {
      res.write(`event: output\n`);
      res.write(`data: ${JSON.stringify({ data: text })}\n\n`);
    }
    for (const ws of session.wsClients) {
      if (ws.readyState === ws.OPEN) ws.send(text);
    }
  });

  consola.info("Modal: waiting for pty-tunnel socket to open", chalk.greenBright(id));
  await socket.waitForOpen();
  consola.info("Modal: pty-tunnel socket open, sending ready", chalk.greenBright(id));
  socket.sendMessage({ type: "ready" });

  ctx.sessions.set(id, session);
  return session;
}
