import { useQuery } from "@tanstack/react-query";
import { getCurrentProfile } from "../api/profile";

export const useCurrentProfileQuery = () =>
  useQuery({
    queryKey: ["currentProfile"],
    queryFn: () => getCurrentProfile(),
    select: (response) => response.data,
  });
