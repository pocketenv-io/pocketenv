import { client } from ".";
import type { Secret } from "../types/secret";

export const addSecret = (sandboxId: string, name: string, value: string) =>
  client.post(
    "/xrpc/io.pocketenv.secret.addSecret",
    {
      secret: {
        sandboxId,
        name,
        value,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const deleteSecret = (id: string) =>
  client.post(`/xrpc/io.pocketenv.secret.deleteSecret`, undefined, {
    params: {
      id,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getSecrets = (
  sandboxId?: string,
  offset?: number,
  limit?: number,
) =>
  client.get<{ secrets: Secret[]; total: number }>(
    `/xrpc/io.pocketenv.secret.getSecrets?sandboxId=${sandboxId}&offset=${offset ?? 0}&limit=${limit ?? 30}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const getSecret = (id: string) =>
  client.get<{ secret: Secret }>(`/xrpc/io.pocketenv.secret.getSecret`, {
    params: {
      id,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const updateSecret = (
  id: string,
  name: string,
  value: string,
  sandboxId: string,
) =>
  client.post(
    "/xrpc/io.pocketenv.secret.updateSecret",
    {
      id,
      secret: {
        name,
        value,
        sandboxId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
