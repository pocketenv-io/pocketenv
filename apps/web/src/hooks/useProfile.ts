import { useQuery } from "@tanstack/react-query";
import { getCurrentProfile } from "../api/profile";
import { useAtom } from "jotai";
import { profileAtom } from "../atoms/profile";

export const useCurrentProfileQuery = () => {
  const [, setProfile] = useAtom(profileAtom);
  return useQuery({
    queryKey: ["currentProfile"],
    queryFn: () => getCurrentProfile(),
    select: (response) => {
      const data = response.data;
      setProfile(data);
      return data;
    },
  });
};
