import { client } from ".";
import type { Sandbox } from "../types/sandbox";

export const createSandbox = ({ base }: { base: string }) =>
  client.post(
    "/xrpc/io.pocketenv.sandbox.createSandbox",
    {
      base,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const claimSandbox = ({ id }: { id: string }) =>
  client.post(
    "/xrpc/io.pocketenv.sandbox.claimSandbox",
    {
      id,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getSandbox = (id: string) =>
  client.get(`/xrpc/io.pocketenv.sandbox.getSandbox?id=${id}`);

export const getSandboxes = (offset?: number, limit?: number) =>
  client.get<{ sandboxes: Sandbox[]; total: number }>(
    `/xrpc/io.pocketenv.sandbox.getSandboxes?offset=${offset ?? 0}&limit=${limit ?? 30}`,
  );
