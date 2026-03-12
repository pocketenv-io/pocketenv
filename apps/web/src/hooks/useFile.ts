import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFile,
  deleteFile,
  getFile,
  getFiles,
  updateFile,
} from "../api/file";

export const useAddFileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["addFile"],
    mutationFn: async ({
      sandboxId,
      path,
      content,
    }: {
      sandboxId: string;
      path: string;
      content: string;
    }) => addFile(sandboxId, path, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

export const useDeleteFileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["deleteFile"],
    mutationFn: async (id: string) => deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
};

export const useFilesQuery = (
  sandboxId?: string,
  offset?: number,
  limit?: number,
) =>
  useQuery({
    queryKey: ["files", sandboxId, offset, limit],
    queryFn: () => getFiles(sandboxId, offset, limit),
    select: (response) => response.data,
  });

export const useFileQuery = (id: string) =>
  useQuery({
    queryKey: ["file", id],
    queryFn: () => getFile(id),
    select: (response) => response.data,
    enabled: !!id,
  });

export const useUpdateFileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateFile"],
    mutationFn: async ({
      id,
      path,
      content,
    }: {
      id: string;
      path: string;
      content: string;
    }) => updateFile(id, path, content),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["file", id] });
    },
  });
};
