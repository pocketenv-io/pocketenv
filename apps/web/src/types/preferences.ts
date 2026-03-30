export type SandboxDetails = {
  name?: string;
  description?: string | null;
  topics?: string[] | null;
  repo?: string | null;
  $type: "io.pocketenv.sandbox.defs#sandboxDetailsPref";
};

export type SandboxProvider = {
  name: string;
  apiKey?: string;
  redactedApiKey?: string;
  organizationId?: string;
  vercelProjectId?: string;
  vercelTeamId?: string;
  $type: "io.pocketenv.sandbox.defs#sandboxProviderPref";
};

export type Preference = SandboxDetails | SandboxProvider;
