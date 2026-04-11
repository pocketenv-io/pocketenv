import cors from "cors";
import express from "express";
import morgan from "morgan";
import { consola } from "consola";
import bsky from "bsky";
import { contextMiddleware, ctx } from "context";
import { createServer } from "lexicon";
import chalk from "chalk";
import API from "./xrpc";
import ssh, { attachWebSocket as attachSshWebSocket } from "./ssh";
import tty, { attachWebSocket as attachTtyWebSocket } from "./tty";
import pty, { attachWebSocket as attachPtyWebSocket } from "./pty";
import { createRateLimiter } from "./ratelimiter";
import { createServer as createHttpServer } from "node:http";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";

let xrpcServer = createServer({
  validateResponse: false,
  payload: {
    jsonLimit: 100 * 1024, // 100kb
    textLimit: 100 * 1024, // 100kb
    blobLimit: 5 * 1024 * 1024, // 5mb
  },
});

xrpcServer = API(xrpcServer, ctx);

const app = express();

app.use(contextMiddleware);
app.use(cors());
app.use(morgan("dev"));
app.use(createRateLimiter({ windowMs: 30_000, max: 500 }));

const banner = `
    ___           __       __
   / _ \\___  ____/ /_____ / /____ ___ _  __
  / ___/ _ \\/ __/  '_/ -_) __/ -_) _ \\ |/ /
 /_/   \\___/\\__/_/\\_\\__/\\__/\\__/_/ /_/___/

  `;

app.get("/", (req, res) => {
  const accept = req.headers.accept || "";
  const wantsHTML = accept.includes("text/html");

  if (wantsHTML) {
    res.contentType("text/html");
    res.send(`<pre>${banner}</pre>`);
    return;
  }
  res.contentType("text/plain");
  res.send(banner);
});

app.use(bsky);
app.use(xrpcServer.xrpc.router);
app.use("/ssh", ssh);
app.use("/tty", tty);
app.use("/pty", pty);

const httpServer = createHttpServer(app);

const wsHandlers = [
  attachPtyWebSocket("/pty"),
  attachTtyWebSocket("/tty"),
  attachSshWebSocket("/ssh"),
];

httpServer.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
  const pathname = new URL(req.url ?? "", "http://localhost").pathname;
  for (const { wss, pathRegex } of wsHandlers) {
    const match = pathname.match(pathRegex);
    if (match) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req, match[1]!);
      });
      return;
    }
  }
  // No handler matched — reject cleanly
  socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
  socket.destroy();
});

httpServer.listen(process.env.POCKETENV_XPRC_PORT || 8789, () => {
  consola.log(chalk.greenBright(banner));
  consola.info(
    `Pocketenv XRPC API is running on port ${process.env.POCKETENV_XPRC_PORT || 8789}`,
  );
});
