import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addService,
  deleteService,
  getServices,
  startService,
  stopService,
  restartService,
  updateService,
} from "../api/service";

export const useAddServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addService"],
    mutationFn: async ({
      sandboxId,
      name,
      command,
      ports,
      description,
    }: {
      sandboxId: string;
      name: string;
      command: string;
      ports?: number[];
      description?: string;
    }) => addService(sandboxId, { name, command, ports, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useUpdateServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateService"],
    mutationFn: async ({
      serviceId,
      name,
      command,
      ports,
      description,
    }: {
      serviceId: string;
      name: string;
      command: string;
      ports?: number[];
      description?: string;
    }) => updateService(serviceId, { name, command, ports, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useDeleteServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteService"],
    mutationFn: async (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useServicesQuery = (sandboxId: string) =>
  useQuery({
    queryKey: ["services", sandboxId],
    queryFn: () => getServices(sandboxId),
    select: (response) => response.data,
    enabled: !!sandboxId,
  });

export const useStartServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["startService"],
    mutationFn: async (id: string) => startService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useStopServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["stopService"],
    mutationFn: async (id: string) => stopService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useRestartServiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["restartService"],
    mutationFn: async (id: string) => {
      await restartService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
