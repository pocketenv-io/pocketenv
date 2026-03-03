import { atom } from "jotai";

export const sessionsAtom = atom<Record<string, string>>({});

// Tracks which sandboxIds have already fired their initialCommand
// Persists across component unmount/remount since it lives outside the component
export const initializedSandboxesAtom = atom<Record<string, boolean>>({});
