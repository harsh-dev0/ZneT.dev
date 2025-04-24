import React from 'react';
import { cn } from '@/lib/utils';
import FileExplorer from './FileExplorer/FileExplorer';
import { PanelLeft, PanelRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from './ui/button';

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
        
          {!isCollapsed && <span className="ml-2 font-bold text-lg text-znet-accent">File <span className="text-sm font-normal text-muted-foreground">Explorer</span></span>}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
        
        <Button
        variant="ghost" 
              size="icon"
          onClick={onToggleCollapse}
          className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-secondary"
        >
          
          {isCollapsed ? (
            <PanelRight size={20} />
          ) : (
            <PanelLeft size={20} />
          )}
        </Button>
        
        </TooltipTrigger>
        <TooltipContent>
          {isCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}

        </TooltipContent>
        </Tooltip>
      </div>
      <div className="h-[calc(100%-3rem)] overflow-hidden">
        {!isCollapsed && <FileExplorer />}
      </div>
    </div>
  );
};

export default Sidebar;
