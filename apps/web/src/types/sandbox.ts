import type { Profile } from "./profile";
import type { Provider } from "./providers";

export type Sandbox = {
  id: string;
  name: string;
  provider: Provider;
  baseSandbox: string;
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
