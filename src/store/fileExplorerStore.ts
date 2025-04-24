import { create } from 'zustand';
import { initialFileSystem } from './fileExplorerStore/mockData';

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

interface FileExplorerState {
  fileSystem: FileSystemItem[];
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  toggleFolderExpand: (id: string) => void;
  addFile: (parentPath: string, name: string) => void;
  addFolder: (parentPath: string, name: string) => void;
  deleteItem: (id: string) => void;
  renameItem: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;
  saveFiles: () => void;
  resetFiles: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const findItemById = (
  items: FileSystemItem[],
  id: string
): FileSystemItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findItemByPath = (
  items: FileSystemItem[],
  path: string
): FileSystemItem | null => {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findItemByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
};
// Agent logic helpers for file operations on the in-memory file system
// These are not part of the zustand state, but operate on it and can be called from anywhere

export function agentListFiles(path: string | undefined, fileSystem: FileSystemItem[]): FileSystemItem[] {
  // If no path, return top-level (root)
  if (!path || path === '/') return fileSystem;
  const folder = findItemByPath(fileSystem, path);
  if (folder && folder.type === 'folder' && folder.children) return folder.children;
  return [];
}

export function agentReadFile(path: string, fileSystem: FileSystemItem[]): string | null {
  const file = findItemByPath(fileSystem, path);
  if (file && file.type === 'file') return file.content ?? '';
  return null;
}

export function agentEditFile(path: string, oldStr: string, newStr: string, updateFileContent: (id: string, content: string) => void, fileSystem: FileSystemItem[]): string {
  const file = findItemByPath(fileSystem, path);
  if (!file || file.type !== 'file') return '❌ File not found.';
  if (oldStr === newStr) return '❌ oldStr and newStr must be different.';
  if (!file.content?.includes(oldStr)) return '❌ oldStr not found in file.';
  const newContent = file.content.replace(new RegExp(oldStr, 'g'), newStr);
  updateFileContent(file.id, newContent);
  return '✅ File edited successfully.';
}

export function agentCreateFile(parentPath: string, name: string, addFile: (parentPath: string, name: string) => void, fileSystem: FileSystemItem[]): string {
  const parent = findItemByPath(fileSystem, parentPath);
  if (!parent || parent.type !== 'folder') return '❌ Parent folder not found.';
  // Check if file already exists
  if (parent.children?.some(c => c.name === name && c.type === 'file')) {
    return '❌ File already exists.';
  }
  addFile(parentPath, name);
  return `✅ Created new file at ${parentPath}/${name}`;
}

export const useFileExplorerStore = create<FileExplorerState>((set, get) => ({
  fileSystem: initialFileSystem,
  activeFileId: null,
  setActiveFileId: (id) => set({ activeFileId: id }),
  toggleFolderExpand: (id) =>
    set((state) => {
      const newFileSystem = [...state.fileSystem];
      const updateExpanded = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          if (item.id === id && item.type === 'folder') {
            return { ...item, expanded: !item.expanded };
          }
          if (item.children) {
            return {
              ...item,
              children: updateExpanded(item.children),
            };
          }
          return item;
        });
      };
      return { fileSystem: updateExpanded(newFileSystem) };
    }),
  addFile: (parentPath, name) =>
    set((state) => {
      const newFileSystem = [...state.fileSystem];
      const addFileToPath = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          if (item.path === parentPath && item.type === 'folder') {
            const newFile: FileSystemItem = {
              id: `file-${generateId()}`,
              name,
              type: 'file',
              path: `${parentPath}/${name}`,
              content: '',
            };
            return {
              ...item,
              expanded: true,
              children: [...(item.children || []), newFile],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addFileToPath(item.children),
            };
          }
          return item;
        });
      };
      const updated = addFileToPath(newFileSystem);
      return { fileSystem: updated };
    }),
  addFolder: (parentPath, name) =>
    set((state) => {
      const newFileSystem = [...state.fileSystem];
      const addFolderToPath = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          if (item.path === parentPath && item.type === 'folder') {
            const newFolder: FileSystemItem = {
              id: `folder-${generateId()}`,
              name,
              type: 'folder',
              path: `${parentPath}/${name}`,
              children: [],
              expanded: false,
            };
            return {
              ...item,
              expanded: true,
              children: [...(item.children || []), newFolder],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addFolderToPath(item.children),
            };
          }
          return item;
        });
      };
      const updated = addFolderToPath(newFileSystem);
      return { fileSystem: updated };
    }),
  deleteItem: (id) =>
    set((state) => {
      const newFileSystem = [...state.fileSystem];
      const deleteFromFileSystem = (
        items: FileSystemItem[]
      ): FileSystemItem[] => {
        return items.filter((item) => {
          if (item.id === id) return false;
          if (item.children) {
            item.children = deleteFromFileSystem(item.children);
          }
          return true;
        });
      };
      const updated = deleteFromFileSystem(newFileSystem);
      return {
        fileSystem: updated,
        activeFileId: state.activeFileId === id ? null : state.activeFileId,
      };
    }),
  renameItem: (id, newName) =>
    set((state) => {
      const newFileSystem = [...state.fileSystem];
      const renameInFileSystem = (
        items: FileSystemItem[]
      ): FileSystemItem[] => {
        return items.map((item) => {
          if (item.id === id) {
            const pathParts = item.path.split('/');
            pathParts[pathParts.length - 1] = newName;
            const newPath = pathParts.join('/');
            return {
              ...item,
              name: newName,
              path: newPath,
            };
          }
          if (item.children) {
            return {
              ...item,
              children: renameInFileSystem(item.children),
            };
          }
          return item;
        });
      };
      const updated = renameInFileSystem(newFileSystem);
      return { fileSystem: updated };
    }),
  updateFileContent: (id, content) =>
    set((state) => {
      const newFileSystem = [...state.fileSystem];
      const updateContent = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          if (item.id === id && item.type === 'file') {
            return { ...item, content };
          }
          if (item.children) {
            return {
              ...item,
              children: updateContent(item.children),
            };
          }
          return item;
        });
      };
      const updated = updateContent(newFileSystem);
      return { fileSystem: updated };
    }),
  
  saveFiles: () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const files = get().fileSystem;
  },
  resetFiles: () => {
    set({ fileSystem: initialFileSystem });
  },
}));