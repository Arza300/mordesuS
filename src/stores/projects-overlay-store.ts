import { create } from "zustand";

type ProjectsOverlayState = {
  open: boolean;
  exploding: boolean;
  openProjects: () => void;
  markOverlayReady: () => void;
  closeProjects: () => void;
};

/**
 * Coordinates hero logo disperse → All Projects overlay.
 */
export const useProjectsOverlayStore = create<ProjectsOverlayState>((set) => ({
  open: false,
  exploding: false,
  openProjects: () => set({ exploding: true, open: false }),
  markOverlayReady: () => set({ open: true, exploding: false }),
  closeProjects: () => set({ open: false, exploding: false }),
}));
