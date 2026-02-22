import { client } from ".";

export const getTerminalToken = () =>
  client.get<{ token: string }>(`/xrpc/io.pocketenv.actor.getTerminalToken`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
