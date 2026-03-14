import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import consola from "consola";

async function logout() {
  const tokenPath = path.join(os.homedir(), ".pocketenv", "token.json");

  try {
    await fs.access(tokenPath);
  } catch {
    consola.log("Logged out successfully");
    return;
  }

  await fs.unlink(tokenPath);
  consola.log("Logged out successfully");
}

export default logout;
