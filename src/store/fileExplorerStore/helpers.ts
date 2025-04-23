import { FileSystemItem } from './types';

export const generateId = () => Math.random().toString(36).substring(2, 10);

export const findItemById = (
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

export const findItemByPath = (
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
