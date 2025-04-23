export type FileType = 'file' | 'folder';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  content?: string;
  children?: FileSystemItem[];
  expanded?: boolean;
  path: string;
}

export interface FileExplorerState {
  fileSystem: FileSystemItem[];
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  toggleFolderExpand: (id: string) => void;
  addFile: (parentPath: string, name: string) => void;
  addFolder: (parentPath: string, name: string) => void;
  deleteItem: (id: string) => void;
  renameItem: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;
}
