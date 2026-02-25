import { client } from ".";

export const addVolume = (sandboxId: string, name: string, path: string) =>
  client.post(
    "/xrpc/io.pocketenv.volume.addVolume",
    {
      sandboxId,
      name,
      path,
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

export const getVolumes = () =>
  client.get("/xrpc/io.pocketenv.volume.getVolumes", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
