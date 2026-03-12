import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addVariable,
  deleteVariable,
  getVariable,
  getVariables,
  updateVariable,
} from "../api/variable";

export const useAddVariableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addVariable"],
    mutationFn: async ({
      sandboxId,
      name,
      value,
    }: {
      sandboxId: string;
      name: string;
      value: string;
    }) => addVariable(sandboxId, name, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variables"] });
    },
  });
};

export const useDeleteVariableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteVariable"],
    mutationFn: async (id: string) => deleteVariable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variables"] });
    },
  });
};

export const useVariablesQuery = (
  sandboxId?: string,
  offset?: number,
  limit?: number,
) =>
  useQuery({
    queryKey: ["variables", sandboxId, offset, limit],
    queryFn: async () => getVariables(sandboxId, offset, limit),
    select: (response) => response.data,
  });

export const useVariableQuery = (id: string) =>
  useQuery({
    queryKey: ["variable", id],
    queryFn: () => getVariable(id),
    select: (response) => response.data,
    enabled: !!id,
  });

export const useUpdateVariableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateVariable"],
    mutationFn: async ({
      id,
      name,
      value,
    }: {
      id: string;
      name: string;
      value: string;
    }) => updateVariable(id, name, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variables"] });
    },
  });
};
