import { client } from ".";
import type { Provider } from "../types/providers";
import type { Sandbox } from "../types/sandbox";

export const createSandbox = ({
  base,
  provider,
}: {
  base: string;
  provider: Provider;
}) =>
  client.post<Sandbox | undefined>(
    "/xrpc/io.pocketenv.sandbox.createSandbox",
    {
      base,
      provider,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const claimSandbox = ({ id }: { id: string }) =>
  client.post<{ sandbox: Sandbox | undefined }>(
    `/xrpc/io.pocketenv.sandbox.claimSandbox?id=${id}`,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getSandbox = (id: string) =>
  client.get<{ sandbox: Sandbox | undefined }>(
    `/xrpc/io.pocketenv.sandbox.getSandbox?id=${id}`,
  );

export const getSandboxes = (offset?: number, limit?: number) =>
  client.get<{ sandboxes: Sandbox[]; total: number }>(
    `/xrpc/io.pocketenv.sandbox.getSandboxes?offset=${offset ?? 0}&limit=${limit ?? 30}`,
  );

export const getActorSandboxes = (
  did: string,
  offset?: number,
  limit?: number,
) =>
  client.get<{ sandboxes: Sandbox[]; total: number }>(
    `/xrpc/io.pocketenv.actor.getActorSandboxes?did=${did}&offset=${offset ?? 0}&limit=${limit ?? 30}`,
  );

export const stopSandbox = (id: string) =>
  client.post(`/xrpc/io.pocketenv.sandbox.stopSandbox?id=${id}`, undefined, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const deleteSandbox = (id: string) =>
  client.post(`/xrpc/io.pocketenv.sandbox.deleteSandbox?id=${id}`, undefined, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const startSandbox = (id: string) =>
  client.post(`/xrpc/io.pocketenv.sandbox.startSandbox?id=${id}`, undefined, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const putPreferences = () =>
  client.post(
    `/xrpc/io.pocketenv.sandbox.putPreferences`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getPreferences = () =>
  client.get(`/xrpc/io.pocketenv.sandbox.getPreferences`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
