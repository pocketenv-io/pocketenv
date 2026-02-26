import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addVariable, deleteVariable, getVariables } from "../api/variable";

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

export const useDeleteVariableMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteVariable"],
    mutationFn: async () => deleteVariable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variables"] });
    },
  });
};

export const useVariablesQuery = () =>
  useQuery({
    queryKey: ["variables"],
    queryFn: async () => getVariables(),
    select: (response) => response.data,
  });
