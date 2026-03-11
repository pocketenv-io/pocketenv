import { useMutation } from "@tanstack/react-query";
import { putPreferences } from "../api/preferences";
import type { Preference } from "../types/preferences";

export const useUpdatePreferencesMutation = () =>
  useMutation({
    mutationKey: ["updatePreferences"],
    mutationFn: async (params: {
      sandboxId: string;
      preferences: Preference[];
    }) => putPreferences(params.sandboxId, params.preferences),
  });
