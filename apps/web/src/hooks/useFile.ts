import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFile, deleteFile, getFiles } from "../api/file";

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

export const useFilesQuery = () =>
  useQuery({
    queryKey: ["files"],
    queryFn: () => getFiles(),
    select: (response) => response.data,
  });
