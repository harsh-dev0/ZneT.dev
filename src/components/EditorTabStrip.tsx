import React from 'react';
import { X } from 'lucide-react';
import { useTabStore } from '@/store/tabStore';
import { useFileExplorerStore } from '@/store/fileExplorerStore';

export default function EditorTabStrip() {
  const { openTabs, activeTabId, closeTab, setActiveTab } = useTabStore();
  const setActiveFileId = useFileExplorerStore((s) => s.setActiveFileId);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setActiveFileId(id);
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    closeTab(id);
    setTimeout(() => {
      setActiveFileId(useTabStore.getState().activeTabId);
    }, 0);
  };

  return (
    <div className="flex h-10 border-b bg-muted/60">
      {openTabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center px-4 cursor-pointer border-r text-sm select-none ${
            tab.id === activeTabId ? 'bg-card font-bold' : 'hover:bg-muted/80'
          }`}
          onClick={() => handleTabClick(tab.id)}
        >
          <span className="mr-2 truncate max-w-[120px]">{tab.name}</span>
          <button
            className="ml-1 p-1 rounded transition-colors hover:bg-red-500 group"
            onClick={(e) => handleClose(e, tab.id)}
          >
            <X size={16} className="text-muted-foreground group-hover:text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}
