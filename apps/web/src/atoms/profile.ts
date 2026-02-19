import { atom } from "jotai";
import type { Profile } from "../types/profile";

export const profileAtom = atom<Profile | undefined>(undefined);
