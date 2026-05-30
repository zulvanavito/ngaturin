import { create } from "zustand";

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;

  // Transaction Modals
  isAddTransactionOpen: boolean;
  setAddTransactionOpen: (isOpen: boolean) => void;
  
  isEditTransactionOpen: boolean;
  setEditTransactionOpen: (isOpen: boolean) => void;
  editingTransactionId: string | null;
  setEditingTransactionId: (id: string | null) => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  toggleCommandPalette: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Sidebar
  isSidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Transaction Modals
  isAddTransactionOpen: false,
  setAddTransactionOpen: (isOpen) => set({ isAddTransactionOpen: isOpen }),

  isEditTransactionOpen: false,
  setEditTransactionOpen: (isOpen) => set({ isEditTransactionOpen: isOpen }),
  editingTransactionId: null,
  setEditingTransactionId: (id) => set({ editingTransactionId: id }),

  // Command Palette
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
}));
