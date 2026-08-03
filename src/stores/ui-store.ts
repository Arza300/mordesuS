import { create } from "zustand";

type UiState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  /** Windows XP easter egg overlay is open */
  xpDesktopOpen: boolean;
  setXpDesktopOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  xpDesktopOpen: false,
  setXpDesktopOpen: (open) => set({ xpDesktopOpen: open }),
}));
