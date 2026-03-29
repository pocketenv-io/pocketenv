import { client } from ".";
import type { Port } from "../types/port";
import type { Provider } from "../types/providers";
import type { Sandbox } from "../types/sandbox";

export const createSandbox = ({
  base,
  provider,
  challenge,
  repo,
}: {
  base: string;
  provider: Provider;
  challenge: string | null;
  repo?: string;
}) =>
  client.post<Sandbox | undefined>(
    "/xrpc/io.pocketenv.sandbox.createSandbox",
    {
      base,
      provider,
      repo,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "X-Challenge": challenge ?? "",
      },
    },
  );

export const claimSandbox = ({ id }: { id: string }) =>
  client.post<{ sandbox: Sandbox | undefined }>(
    "/xrpc/io.pocketenv.sandbox.claimSandbox",
    undefined,
    {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getSandbox = (id: string) =>
  client.get<{ sandbox: Sandbox | undefined }>(
    "/xrpc/io.pocketenv.sandbox.getSandbox",
    {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
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
  client.post("/xrpc/io.pocketenv.sandbox.stopSandbox", undefined, {
    params: {
      id,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const deleteSandbox = (id: string) =>
  client.post("/xrpc/io.pocketenv.sandbox.deleteSandbox", undefined, {
    params: {
      id,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const startSandbox = (id: string) =>
  client.post(
    "/xrpc/io.pocketenv.sandbox.startSandbox",
    {},
    {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

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

export const exposePort = (
  id: string,
  {
    port,
    description,
  }: {
    port: number;
    description?: string;
  },
) =>
  client.post(
    `/xrpc/io.pocketenv.sandbox.exposePort`,
    { port, description },
    {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const unexposePort = (id: string, port: number) =>
  client.post(
    `/xrpc/io.pocketenv.sandbox.unexposePort`,
    { port },
    {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getExposedPorts = (id: string) =>
  client.get<{ ports: Port[] }>(`/xrpc/io.pocketenv.sandbox.getExposedPorts`, {
    params: {
      id,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const exposeVscode = (id: string) =>
  client.post<{ previewUrl?: string }>(
    `/xrpc/io.pocketenv.sandbox.exposeVscode`,
    undefined,
    {
      params: {
        id,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
