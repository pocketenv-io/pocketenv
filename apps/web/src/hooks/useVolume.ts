import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addVolume,
  deleteVolume,
  getVolume,
  getVolumes,
  updateVolume,
} from "../api/volume";

export const useAddVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sandboxId,
      name,
      path,
    }: {
      sandboxId: string;
      name: string;
      path: string;
    }) => addVolume(sandboxId, name, path),
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

export const useVolumesQuery = (
  sandboxId?: string,
  offset?: number,
  limit?: number,
) =>
  useQuery({
    queryKey: ["volumes", sandboxId, offset, limit],
    queryFn: async () => getVolumes(sandboxId, offset, limit),
    select: (response) => response.data,
  });

export const useVolumeQuery = (id: string) =>
  useQuery({
    queryKey: ["volume", id],
    queryFn: () => getVolume(id),
    select: (response) => response.data,
    enabled: !!id,
  });

export const useUpdateVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      path,
    }: {
      id: string;
      name: string;
      path: string;
    }) => updateVolume(id, name, path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volumes"] });
    },
  });
};
