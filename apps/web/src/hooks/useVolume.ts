import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addVolume, deleteVolume, getVolumes } from "../api/volume";

export const useAddVolumeMutation = (
  sandboxId: string,
  name: string,
  path: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => addVolume(sandboxId, name, path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volumes"] });
    },
  });
};

export const useDeleteVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteVolume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volumes"] });
    },
  });
};

export const useVolumesQuery = () =>
  useQuery({
    queryKey: ["volumes"],
    queryFn: async () => getVolumes(),
    select: (response) => response.data,
  });
