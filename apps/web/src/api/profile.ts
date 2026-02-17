import { client } from ".";
import type { Profile } from "../types/profile";

export const getCurrentProfile = () =>
  client.get<Profile>(`/xrpc/io.pocketenv.actor.getProfile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getProfile = (did: string) =>
  client.get<Profile>(`/xrpc/io.pocketenv.actor.getProfile?did=${did}`);
