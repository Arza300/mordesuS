import { create } from "zustand";

type ProjectsOverlayState = {
  open: boolean;
  exploding: boolean;
  morphing: boolean;
  openProjects: () => void;
  /** Overlay mounts; morph layer flies shards → project cards */
  beginMorph: () => void;
  /** Morph finished; reveal real cards */
  completeMorph: () => void;
  /** Empty-projects path: open overlay with no morph */
  markOverlayReady: () => void;
  closeProjects: () => void;
};

/**
 * Coordinates hero logo disperse → project morph → All Projects overlay.
 */
export const useProjectsOverlayStore = create<ProjectsOverlayState>((set) => ({
  open: false,
  exploding: false,
  morphing: false,
  openProjects: () => set({ exploding: true, open: false, morphing: false }),
  beginMorph: () => set({ open: true, morphing: true, exploding: true }),
  completeMorph: () => set({ morphing: false, exploding: false, open: true }),
  markOverlayReady: () =>
    set({ open: true, exploding: false, morphing: false }),
  closeProjects: () => set({ open: false, exploding: false, morphing: false }),
}));
