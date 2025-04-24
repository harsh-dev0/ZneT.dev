import React from 'react';
import { FileSystemItem, useFileExplorerStore } from '@/store/fileExplorerStore';
import { cn } from '@/lib/utils';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import FileContextMenu from './FileContextMenu';

interface FileTreeItemProps {
  item: FileSystemItem;
  depth: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ item, depth }) => {
  const activeFileId = useFileExplorerStore((state) => state.activeFileId);
  const setActiveFileId = useFileExplorerStore((state) => state.setActiveFileId);
  const toggleFolderExpand = useFileExplorerStore((state) => state.toggleFolderExpand);

  const isActive = activeFileId === item.id;
  const isFolder = item.type === 'folder';
  const isExpanded = isFolder && item.expanded;

  const handleClick = () => {
    if (isFolder) {
      toggleFolderExpand(item.id);
    } else {
      setActiveFileId(item.id);
    }
  };

  return (
    <div>
      <FileContextMenu item={item}>
        <div
          className={cn('file-explorer-item group', {
            'active': isActive && !isFolder,
          })}
          style={{ paddingLeft: `${depth * 16}px` }}
          onClick={handleClick}
        >
          <div className="flex items-center flex-1 overflow-hidden">
            {isFolder ? (
              <>
                <span className="mr-1 text-xs">
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={14} className="text-muted-foreground" />
                  )}
                </span>
                <Folder size={16} className="folder-icon" />
              </>
            ) : (
              <File size={16} className="file-icon" />
            )}
            <span className="truncate">{item.name}</span>
          </div>
        </div>
      </FileContextMenu>
      
      {isFolder && isExpanded && item.children && (
        <div>
          {[...item.children]
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              if (a.type === 'folder') return -1;
              return 1;
            })
            .map((child) => (
              <FileTreeItem key={child.id} item={child} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeItem;