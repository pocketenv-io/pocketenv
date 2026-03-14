import { client } from "../client";
import open from "open";
import express, { type Request, type Response } from "express";
import cors from "cors";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import chalk from "chalk";

async function login(handle: string) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = app.listen(6997);

  app.post("/token", async (req: Request, res: Response) => {
    console.log(chalk.bold(chalk.greenBright("Login successful!\n")));
    const tokenPath = path.join(os.homedir(), ".pocketenv", "token.json");
    await fs.mkdir(path.dirname(tokenPath), { recursive: true });
    await fs.writeFile(
      tokenPath,
      JSON.stringify({ token: req.body.token }, null, 2),
    );

    res.json({
      ok: 1,
    });

    server.close();
  });

  const response = await client.post(`/login`, { handle, cli: true });

  const redirectUrl = response.data;

  if (!redirectUrl.includes("authorize")) {
    console.error("Failed to login, please check your handle and try again.");
    server.close();
    return;
  }

  console.log("Please visit this URL to authorize the app:");
  console.log(chalk.cyan(redirectUrl));

  await open(response.data);
}

export default login;
