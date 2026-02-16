import cors from "cors";
import express from "express";
import morgan from "morgan";
import { consola } from "consola";
import bsky from "bsky";
import { contextMiddleware, ctx } from "context";
import { createServer } from "lexicon";
import chalk from "chalk";
import API from "./xrpc";

let server = createServer({
  validateResponse: false,
  payload: {
    jsonLimit: 100 * 1024, // 100kb
    textLimit: 100 * 1024, // 100kb
    blobLimit: 5 * 1024 * 1024, // 5mb
  },
});

server = API(server, ctx);

const app = express();

app.use(contextMiddleware);
app.use(cors());
app.use(morgan("dev"));

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
app.use(server.xrpc.router);

app.listen(process.env.POCKETENV_XPRC_PORT || 8789, () => {
  console.log(chalk.greenBright(banner));
  consola.info(
    `Pocketenv XRPC API is running on port ${process.env.POCKETENV_XRPC_PORT || 8789}`,
  );
});
