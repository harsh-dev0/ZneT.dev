import { create } from 'zustand';

interface Tab {
  id: string;
  name: string;
}

interface TabState {
  openTabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTabStore = create<TabState>((set, get) => ({
  openTabs: [],
  activeTabId: null,
  openTab: (tab) => {
    const exists = get().openTabs.some((t) => t.id === tab.id);
    set({
      openTabs: exists ? get().openTabs : [...get().openTabs, tab],
      activeTabId: tab.id,
    });
  },
  closeTab: (id) => {
    const { openTabs, activeTabId } = get();
    const filtered = openTabs.filter((t) => t.id !== id);
    let newActive = activeTabId;
    if (activeTabId === id) {
      if (filtered.length > 0) {
        newActive = filtered[filtered.length - 1].id;
      } else {
        newActive = null;
      }
    }
    set({ openTabs: filtered, activeTabId: newActive });
  },
  setActiveTab: (id) => set({ activeTabId: id }),
}));
