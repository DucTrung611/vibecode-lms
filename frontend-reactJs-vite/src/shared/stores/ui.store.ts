import { create } from 'zustand';

interface UiState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  sidebarCollapsed: false,
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
