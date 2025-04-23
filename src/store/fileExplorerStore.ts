import { create } from 'zustand';

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
}

const generateId = () => Math.random().toString(36).substring(2, 10);

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

const initialFileSystem: FileSystemItem[] = [
  {
    id: 'folder-1',
    name: 'project',
    type: 'folder',
    expanded: true,
    path: '/project',
    children: [
      {
        id: 'folder-2',
        name: 'src',
        type: 'folder',
        expanded: false,
        path: '/project/src',
        children: [
          {
            id: 'file-1',
            name: 'index.tsx',
            type: 'file',
            path: '/project/src/index.tsx',
            content: 'import React from "react";\n\nfunction App() {\n  return <div>Hello ZneT!</div>;\n}\n\nexport default App;',
          },
          {
            id: 'file-2',
            name: 'styles.css',
            type: 'file',
            path: '/project/src/styles.css',
            content: '.container {\n  max-width: 1200px;\n  margin: 0 auto;\n}',
          },
        ],
      },
      {
        id: 'file-3',
        name: 'package.json',
        type: 'file',
        path: '/project/package.json',
        content: '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}',
      },
    ],
  },
];

export const useFileExplorerStore = create<FileExplorerState>((set) => ({
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
      
      return { fileSystem: addFileToPath(newFileSystem) };
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
      
      return { fileSystem: addFolderToPath(newFileSystem) };
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
      
      return { 
        fileSystem: deleteFromFileSystem(newFileSystem),
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
      
      return { fileSystem: renameInFileSystem(newFileSystem) };
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
      
      return { fileSystem: updateContent(newFileSystem) };
    }),
}));
