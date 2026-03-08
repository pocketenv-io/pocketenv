import { client } from ".";
import type { Volume } from "../types/volume";

export const addVolume = (sandboxId: string, name: string, path: string) =>
  client.post(
    "/xrpc/io.pocketenv.volume.addVolume",
    {
      volume: {
        sandboxId,
        name,
        path,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

export const deleteVolume = (id: string) =>
  client.post(`/xrpc/io.pocketenv.volume.deleteVolume?id=${id}`, undefined, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getVolumes = (
  sandboxId?: string,
  offset?: number,
  limit?: number,
) =>
  client.get<{ volumes: Volume[]; total: number }>(
    `/xrpc/io.pocketenv.volume.getVolumes${sandboxId ? `?sandboxId=${sandboxId}` : ""}&offset=${offset ?? 0}&limit=${limit ?? 30}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
