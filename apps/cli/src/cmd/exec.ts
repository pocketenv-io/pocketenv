import consola from "consola";
import getAccessToken from "../lib/getAccessToken";
import { client } from "../client";
import { env } from "../lib/env";

export async function exec(sandbox: string, command: string[]) {
  const token = await getAccessToken();

  try {
    const [cmd, ...args] = command;
    const response = await client.post<{
      stderr: string;
      stdout: string;
      exitCode: number;
    }>(
      "/xrpc/io.pocketenv.sandbox.exec",
      {
        command: `${cmd} ${args.join(" ")}`,
      },
      {
        params: {
          id: sandbox,
        },
        headers: {
          Authorization: `Bearer ${env.POCKETENV_TOKEN || token}`,
        },
      },
    );

    process.stdout.write(response.data.stdout);
    process.stderr.write(response.data.stderr);

    if (response.data.exitCode !== 0) {
      consola.error(`Command exited with code ${response.data.exitCode}`);
    }

    process.exit(response.data.exitCode);
  } catch (error) {
    consola.error("Failed to execute command:", error);
  }
}
