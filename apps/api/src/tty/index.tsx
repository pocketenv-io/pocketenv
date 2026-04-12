import { SpritesClient, type ExecResult } from "@fly/sprites";
import { consola } from "consola";
import type { Context } from "context";
import * as context from "context";
import { eq } from "drizzle-orm";
import express, { Router } from "express";
import { env } from "lib/env";
import jwt from "jsonwebtoken";
import schema from "schema";
import decrypt from "lib/decrypt";
import path from "node:path";
import { WebSocketServer, type WebSocket } from "ws";
import type { IncomingMessage } from "http";

const router = Router();
router.use((req, res, next) => {
  req.ctx = context.ctx;
  next();
});
router.use(express.json());

router.use((req, res, next) => {
  req.sandboxId = req.headers["x-sandbox-id"] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.split("Bearer ")[1]?.trim();
  if (bearer && bearer !== "null") {
    try {
      const credentials = jwt.verify(bearer, env.JWT_SECRET, {
        ignoreExpiration: true,
      }) as { did: string };

      req.did = credentials.did;
    } catch (err) {
      consola.error("Invalid JWT token:", err);
    }
  }

  next();
});

type Session = {
  cmd: any;
  clients: Set<express.Response>;
  wsClients: Set<WebSocket>;
};

const sessions = new Map<string, Session>();

async function createTerminalSession(ctx: Context, id: string) {
  const [sandbox] = await ctx.db
    .select()
    .from(schema.sandboxes)
    .where(eq(schema.sandboxes.id, id))
    .execute();

  if (!sandbox) {
    consola.error(`Sandbox not found: ${id}`);
    throw new Error(`Sandbox not found: ${id}`);
  }

  const [
    variables,
    secrets,
    files,
    sshKeys,
    [tailscale],
    volumes,
    [spriteAuth],
  ] = await Promise.all([
    ctx.db
      .select()
      .from(schema.sandboxVariables)
      .leftJoin(
        schema.variables,
        eq(schema.variables.id, schema.sandboxVariables.variableId),
      )
      .where(eq(schema.sandboxVariables.sandboxId, id))
      .execute(),
    ctx.db
      .select()
      .from(schema.sandboxSecrets)
      .leftJoin(
        schema.secrets,
        eq(schema.secrets.id, schema.sandboxSecrets.secretId),
      )
      .where(eq(schema.sandboxSecrets.sandboxId, id))
      .execute(),
    ctx.db
      .select()
      .from(schema.sandboxFiles)
      .leftJoin(schema.files, eq(schema.files.id, schema.sandboxFiles.fileId))
      .where(eq(schema.sandboxFiles.sandboxId, id))
      .execute(),
    ctx.db
      .select()
      .from(schema.sshKeys)
      .where(eq(schema.sshKeys.sandboxId, id))
      .execute(),
    ctx.db
      .select()
      .from(schema.tailscaleAuthKeys)
      .where(eq(schema.tailscaleAuthKeys.sandboxId, id))
      .execute(),
    ctx.db
      .select()
      .from(schema.sandboxVolumes)
      .leftJoin(
        schema.sandboxes,
        eq(schema.sandboxes.id, schema.sandboxVolumes.sandboxId),
      )
      .leftJoin(schema.users, eq(schema.users.id, schema.sandboxes.userId))
      .where(eq(schema.sandboxVolumes.sandboxId, id))
      .execute(),
    ctx.db
      .select()
      .from(schema.spriteAuth)
      .where(eq(schema.spriteAuth.sandboxId, sandbox.id))
      .execute(),
  ]);

  const spriteToken = decrypt(spriteAuth!.spriteToken);
  const client = new SpritesClient(spriteToken);
  const sprite = client.sprite(sandbox.sandboxId!);
  const cmd = sprite.spawn("bash", ["-i"], {
    tty: true,
    rows: 24,
    cols: 80,
    env: {
      TERM: "xterm-256color",
      ...variables
        .map(({ variables }) => variables)
        .filter((v) => v !== null)
        .reduce(
          (acc, v) => {
            acc[v.name] = v.value;
            return acc;
          },
          {} as Record<string, string>,
        ),
      ...secrets
        .map(({ secrets }) => secrets)
        .filter((s) => s !== null)
        .reduce(
          (acc, s) => {
            acc[s.name] = decrypt(s.value);
            return acc;
          },
          {} as Record<string, string>,
        ),
    },
  });

  const mkdir = async (absolutePath: string): Promise<ExecResult> =>
    sprite.execFile("mkdir", ["-p", absolutePath]);

  const writeFile = async (
    absolutePath: string,
    content: string,
  ): Promise<void> => {
    const basePath = path.dirname(absolutePath);
    if (basePath !== "/" && basePath != ".") {
      await mkdir(basePath);
    }
    await sprite.execFile("sh", ["-c", `echo '${content}' > ${absolutePath}`]);
  };

  const setupDefaultSshKeys = async (): Promise<void> => {
    await sprite.execFile("bash", [
      "-c",
      '[ -f /home/sprite/.ssh/id_ed25519 ] || ssh-keygen -t ed25519 -f /home/sprite/.ssh/id_ed25519 -q -N ""',
    ]);
  };

  const setupSshKeys = async (
    privateKey: string,
    publicKey: string,
  ): Promise<void> => {
    await writeFile("/home/sprite/.ssh/id_ed25519", privateKey);
    await writeFile("/home/sprite/.ssh/id_ed25519.pub", publicKey);
    await sprite.execFile("chmod", ["600", "/home/sprite/.ssh/id_ed25519"]);
    await sprite.execFile("chmod", ["644", "/home/sprite/.ssh/id_ed25519.pub"]);
    await sprite.exec("rm -f /home/sprite/.ssh/known_hosts");
    await sprite.execFile("bash", [
      "-c",
      "ssh-keyscan -t rsa tangled.org >> /home/sprite/.ssh/known_hosts",
    ]);
    await sprite.execFile("bash", [
      "-c",
      "ssh-keyscan -t rsa github.com >> /home/sprite/.ssh/known_hosts",
    ]);
  };

  const setupTailscale = async (authKey: string): Promise<void> => {
    try {
      await sprite.execFile("bash", [
        "-c",
        "PATH=$(cat /etc/profile.d/languages_paths):$PATH type pm2 || npm install -g pm2",
      ]);
      await sprite.execFile("bash", [
        "-c",
        "type tailscaled || curl -fsSL https://tailscale.com/install.sh | sh || true",
      ]);
      await sprite.exec(
        "PATH=$(cat /etc/profile.d/languages_paths):$PATH  pm2 start tailscaled",
      );
      await sprite.execFile("bash", [
        "-c",
        `tailscale up --auth-key=${authKey}`,
      ]);
    } catch (e) {
      consola.error("failed to setup tailscale", e);
    }
  };

  const mount = async (path: string, prefix?: string): Promise<void> => {
    try {
      await sprite.execFile("bash", [
        "-c",
        `type s3fs || apt-get update && apt-get install -y s3fs || sudo apt-get update && sudo apt-get install -y s3fs`,
      ]);
      await sprite.execFile("bash", [
        "-c",
        `mkdir -p ${path} || sudo mkdir -p ${path}`,
      ]);

      const passwdFile = `/tmp/.passwd-s3fs-${crypto.randomUUID()}`;

      await writeFile(
        passwdFile,
        `${env.R2_ACCESS_KEY_ID}:${env.R2_SECRET_ACCESS_KEY}`,
      );

      await sprite.execFile("bash", ["-c", `chmod 0600 '${passwdFile}'`]);

      const bucketPath = prefix
        ? `${env.VOLUME_BUCKET}:${prefix}`
        : env.VOLUME_BUCKET;

      await sprite.execFile("bash", [
        "-c",
        `s3fs '${bucketPath}' '${path}' -o 'passwd_file=${passwdFile},nomixupload,compat_dir,url=https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com'`,
      ]);
    } catch (error) {
      consola.error("Error mounting S3 bucket:", error);
    }
  };

  const unmount = async (path: string): Promise<void> => {
    try {
      await sprite.execFile("bash", [
        "-c",
        `fusermount -u ${path} || sudo fusermount -u ${path} || umount ${path}`,
      ]);
    } catch (error) {
      consola.error("Error unmounting S3 bucket:", error);
    }
  };

  await setupDefaultSshKeys();

  Promise.all([
    ...files
      .filter((x) => x.files !== null)
      .map(async (record) =>
        writeFile(record.sandbox_files.path, decrypt(record.files!.content)),
      ),
    ...sshKeys.map(async (record) =>
      setupSshKeys(decrypt(record.privateKey), record.publicKey),
    ),
    tailscale && setupTailscale(decrypt(tailscale.authKey)),
    ...volumes.map((volume) =>
      mount(
        volume.sandbox_volumes.path,
        `/${volume.users?.did || ""}${volume.users?.did ? "/" : ""}${volume.sandbox_volumes.id}/`,
      ),
    ),
  ])
    .then(() => consola.success(`Sandbox ${id} is ready`))
    .catch((err) => consola.error(`Error setting up sandbox ${id}:`, err));

  const session: Session = {
    cmd,
    clients: new Set(),
    wsClients: new Set(),
  };

  cmd.stdout.on("data", (chunk: Buffer | string) => {
    const data = chunk.toString("utf8");

    for (const res of session.clients) {
      res.write(`event: output\n`);
      res.write(`data: ${JSON.stringify({ data })}\n\n`);
    }
    for (const ws of session.wsClients) {
      if (ws.readyState === ws.OPEN) ws.send(data);
    }
  });

  cmd.on?.("exit", (code: number) => {
    for (const res of session.clients) {
      res.write(`event: exit\n`);
      res.write(`data: ${JSON.stringify({ code })}\n\n`);
    }
    for (const ws of session.wsClients) {
      if (ws.readyState === ws.OPEN) ws.close(1000, "exit");
    }
    session.clients.clear();
    session.wsClients.clear();
    sessions.delete(id);
  });

  cmd.on?.("error", (err: Error) => {
    for (const res of session.clients) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: err.message })}\n\n`);
    }
    for (const ws of session.wsClients) {
      if (ws.readyState === ws.OPEN) ws.close(1011, err.message);
    }
    session.clients.clear();
    session.wsClients.clear();
    sessions.delete(id);
  });

  sessions.set(id, session);
  return session;
}

async function getSession(ctx: Context, id: string) {
  return sessions.get(id) ?? (await createTerminalSession(ctx, id));
}

router.get("/:id/stream", async (req, res) => {
  const { id } = req.params;
  const session = await getSession(req.ctx, id);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  session.clients.add(res);

  const keepAlive = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
    session.clients.delete(res);
  });
});

router.post("/:id/input", express.text({ type: "*/*" }), async (req, res) => {
  const { id } = req.params;
  const session = await getSession(req.ctx, id);

  const input = typeof req.body === "string" ? req.body : "";
  session.cmd.stdin.write(input);

  res.status(204).end();
});

router.post("/:id/resize", async (req, res) => {
  const { id } = req.params;
  const session = await getSession(req.ctx, id);

  const cols = Number(req.body?.cols);
  const rows = Number(req.body?.rows);

  if (!Number.isInteger(cols) || !Number.isInteger(rows)) {
    res.status(400).json({ error: "Invalid cols/rows" });
    return;
  }

  session.cmd.resize(cols, rows);
  res.status(204).end();
});

export default router;

export function attachWebSocket(base: string) {
  const pathRegex = new RegExp(`^${base}/([^/]+)/ws$`);
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage, id: string) => {
    const url = new URL(req.url ?? "", "http://localhost");
    const tokenParam = url.searchParams.get("token");
    const authHeader = req.headers.authorization;
    const bearer = tokenParam ?? authHeader?.split("Bearer ")[1]?.trim();
    if (bearer && bearer !== "null") {
      try {
        jwt.verify(bearer, env.JWT_SECRET, { ignoreExpiration: true });
      } catch (err) {
        consola.error("WS: Invalid JWT token:", err);
        ws.close(1008, "Invalid token");
        return;
      }
    }

    // Buffer messages that arrive before the session is ready.
    const pendingMessages: Buffer[] = [];
    const bufferMessage = (data: Buffer) => pendingMessages.push(data);
    ws.on("message", bufferMessage);

    let session: Session;
    try {
      session = await getSession(context.ctx, id);
    } catch (err) {
      consola.error("WS: Failed to get session:", err);
      ws.close(1011, "Session error");
      return;
    }

    session.wsClients.add(ws);
    ws.off("message", bufferMessage);

    const handleMessage = (data: Buffer) => {
      const text = data.toString("utf-8");
      try {
        const msg = JSON.parse(text);
        if (msg?.type === "resize" && Number.isInteger(msg.cols) && Number.isInteger(msg.rows)) {
          session.cmd.resize(msg.cols, msg.rows);
          return;
        }
      } catch {
        // not JSON — treat as raw input
      }
      session.cmd.stdin.write(text);
    };

    // Replay messages buffered during session setup (e.g. the initial resize).
    for (const data of pendingMessages) {
      handleMessage(data);
    }

    ws.on("message", (data) => handleMessage(data as Buffer));

    ws.on("close", () => {
      session.wsClients.delete(ws);
    });

    // Trigger a fresh prompt redraw (initial output was lost while wsClients was empty).
    session.cmd.stdin.write("\n");
  });

  return { wss, pathRegex };
}
