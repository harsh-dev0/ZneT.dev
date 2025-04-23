import React from 'react';
import { useFileExplorerStore } from '@/store/fileExplorerStore';
import FileTreeItem from './FileTreeItem';

const FileExplorer: React.FC = () => {
  const fileSystem = useFileExplorerStore((state) => state.fileSystem);

  return (
    <div className="h-full overflow-auto pb-20">
      <div className="px-2 py-2">
        {fileSystem.map((item) => (
          <FileTreeItem key={item.id} item={item} depth={0} />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
