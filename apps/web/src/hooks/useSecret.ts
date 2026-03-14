import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSecret,
  deleteSecret,
  getSecret,
  getSecrets,
  updateSecret,
} from "../api/secret";

export const useAddSecretMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addSecret"],
    mutationFn: async ({
      sandboxId,
      name,
      value,
    }: {
      sandboxId: string;
      name: string;
      value: string;
    }) => addSecret(sandboxId, name, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets"] });
    },
  });
};

export const useDeleteSecretMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteSecret"],
    mutationFn: async (id: string) => deleteSecret(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets"] });
    },
  });
};

export const useSecretsQuery = (
  sandboxId?: string,
  offset?: number,
  limit?: number,
) =>
  useQuery({
    queryKey: ["secrets", sandboxId, offset, limit],
    queryFn: () => getSecrets(sandboxId, offset, limit),
    select: (response) => response.data,
  });

export const useSecretQuery = (id: string) =>
  useQuery({
    queryKey: ["secret", id],
    queryFn: () => getSecret(id),
    select: (response) => response.data,
    enabled: !!id,
  });

export const useUpdateSecretMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateSecret"],
    mutationFn: async ({
      id,
      name,
      value,
      sandboxId,
    }: {
      id: string;
      name: string;
      value: string;
      sandboxId: string;
    }) => updateSecret(id, name, value, sandboxId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["secret", id] });
      queryClient.invalidateQueries({ queryKey: ["secrets"] });
    },
  });
};
