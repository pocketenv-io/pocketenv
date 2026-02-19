import type { Profile } from "./profile";

export type Sandbox = {
  id: string;
  name: string;
  displayName: string;
  uri: string;
  description?: string;
  logo?: string;
  readme?: string;
  vcpus?: number;
  memory?: number;
  installs: number;
  status: "RUNNING" | "STOPPED";
  startedAt?: string;
  createdAt: string;
  owner: Profile | null;
};
