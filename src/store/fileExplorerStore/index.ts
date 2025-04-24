import { create } from 'zustand';
import { FileExplorerState, FileSystemItem } from './types';
import { generateId } from './helpers';
import { initialFileSystem } from './mockData';

export * from './types';

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
  
  deleteItem: (id) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const useTabStore = require('@/store/tabStore').useTabStore;
    set((state) => {
      const newFileSystem = [...state.fileSystem];
      const deletedIds: string[] = [];
      const collectDeleted = (items: FileSystemItem[]): void => {
        for (const item of items) {
          if (item.id === id) {
            deletedIds.push(item.id);
            if (item.children) {
              const collectChildren = (children: FileSystemItem[]) => {
                for (const child of children) {
                  deletedIds.push(child.id);
                  if (child.children) collectChildren(child.children);
                }
              };
              collectChildren(item.children);
            }
          } else if (item.children) {
            collectDeleted(item.children);
          }
        }
      };
      collectDeleted(newFileSystem);
      const deleteFromFileSystem = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.filter((item) => {
          if (deletedIds.includes(item.id)) return false;
          if (item.children) {
            item.children = deleteFromFileSystem(item.children);
          }
          return true;
        });
      };
      setTimeout(() => {
        const tabStore = useTabStore.getState();
        for (const did of deletedIds) {
          tabStore.closeTab(did);
        }
      }, 0);
      return {
        fileSystem: deleteFromFileSystem(newFileSystem),
        activeFileId: deletedIds.includes(state.activeFileId as string) ? null : state.activeFileId,
      };
    });
  },
  
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
