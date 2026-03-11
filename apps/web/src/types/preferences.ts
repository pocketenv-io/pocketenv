export type SandboxDetails = {
  name?: string;
  description?: string;
  topics?: string[];
  repo?: string;
  $type: "io.pocketenv.sandbox.defs#sandboxDetailsPref";
};

export type Preference = SandboxDetails;
