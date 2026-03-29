import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPreferences, putPreferences } from "../api/preferences";
import type { Preference } from "../types/preferences";

export const useUpdatePreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updatePreferences"],
    mutationFn: async (params: {
      sandboxId: string;
      preferences: Preference[];
    }) => putPreferences(params.sandboxId, params.preferences),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["preferences", variables.sandboxId],
      });
    },
  });
};

export const usePreferences = (sandboxId: string) =>
  useQuery({
    queryKey: ["preferences", sandboxId],
    queryFn: async () => getPreferences(sandboxId),
    select: (response) => response.data,
    enabled: !!sandboxId,
  });
