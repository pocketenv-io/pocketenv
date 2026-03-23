import { client } from "../client";
import type { Sandbox } from "../types/sandbox";

async function waitUntilRunning(
  name: string,
  authToken: string,
  timeoutMs = 60_000,
  intervalMs = 2_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const response = await client.get<{ sandbox: Sandbox | null }>(
      "/xrpc/io.pocketenv.sandbox.getSandbox",
      {
        params: { id: name },
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    if (response.data.sandbox?.status === "RUNNING") return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(
    `Sandbox ${name} did not reach RUNNING state within ${timeoutMs / 1000}s`,
  );
}

export default waitUntilRunning;
