import React from 'react';
import { cn } from '@/lib/utils';
import FileExplorer from './FileExplorer/FileExplorer';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  isCollapsed = false,
  onToggleCollapse,
  ...props
}) => {
  return (
    <div
      className={cn(
        'h-full border-r bg-card transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-12' : 'w-64',
        className
      )}
      {...props}
    >
      <div className="h-12 border-b flex items-center px-4 sticky top-0 bg-card z-10">
        <div className="flex-1 overflow-hidden">
          {!isCollapsed && <span className="font-semibold">File Explorer</span>}
        </div>
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            {isCollapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>
      <div className="h-[calc(100%-3rem)] overflow-hidden">
        {!isCollapsed && <FileExplorer />}
      </div>
    </div>
  );
};

export default Sidebar;
