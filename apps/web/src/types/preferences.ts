export type SandboxDetails = {
  name?: string;
  description?: string | null;
  topics?: string[] | null;
  repo?: string | null;
  $type: "io.pocketenv.sandbox.defs#sandboxDetailsPref";
};

export type Preference = SandboxDetails;
