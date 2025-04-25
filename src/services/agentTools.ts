import { FileSystemItem, useFileExplorerStore } from '@/store/fileExplorerStore';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: Record<string, any>;
    required: string[];
    additionalProperties: boolean;
  };  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function: (input: any) => Promise<string>;
}


const findItemByPath = (
  items: FileSystemItem[],
  path: string
): FileSystemItem | null => {
  path = path.endsWith('/') ? path.slice(0, -1) : path;
  
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findItemByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
};

export const createReadFileTool = (): ToolDefinition => ({
  name: "read_file",
  description: "Reads the contents of a file at a given relative path. Only use for text files.",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Relative path, e.g. './src/App.jsx'",
      },
    },
    required: ["path"],
    additionalProperties: false,
  },
  function: async ({ path }: { path: string }) => {
    try {
      // Get the current file system state
      const fileSystem = useFileExplorerStore.getState().fileSystem;
      
      // Normalize path
      const normalizedPath = path.startsWith('./') 
        ? `/project${path.substring(1)}` 
        : path.startsWith('/') 
          ? path 
          : `/project/${path}`;
      
      // Find the file
      const file = findItemByPath(fileSystem, normalizedPath);
      
      if (!file) {
        return `❌ Error reading file: File not found at path ${path}`;
      }
      
      if (file.type !== 'file') {
        return `❌ Error reading file: ${path} is not a file`;
      }
      
      return file.content || '';
    } catch (e) {
      return `❌ Error reading file: ${(e as Error).message}`;
    }
  },
});

// Create a list files tool that uses the mock file system
export const createListFilesTool = (): ToolDefinition => ({
  name: "list_files",
  description: "Lists files and directories at a given path. Defaults to '.' if no path provided.",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Optional path to list contents from.",
      },
    },
    required: [],
    additionalProperties: false,
  },
  function: async ({ path = "." }: { path?: string }) => {
    try {
      // Get the current file system state
      const fileSystem = useFileExplorerStore.getState().fileSystem;
      
      // Normalize path
      const normalizedPath = path === "." 
        ? "/project" 
        : path.startsWith('./') 
          ? `/project${path.substring(1)}` 
          : path.startsWith('/') 
            ? path 
            : `/project/${path}`;
      
      // Find the directory
      const dir = findItemByPath(fileSystem, normalizedPath);
      
      if (!dir) {
        return `❌ Error listing files: Directory not found at path ${path}`;
      }
      
      if (dir.type !== 'folder') {
        return `❌ Error listing files: ${path} is not a directory`;
      }
      
      const list = dir.children?.map(item => 
        item.type === 'folder' ? `${item.name}/` : item.name
      ) || [];
      
      return JSON.stringify(list, null, 2);
    } catch (e) {
      return `❌ Error listing files: ${(e as Error).message}`;
    }
  },
});

// Create an edit file tool that uses the mock file system
export const createEditFileTool = (): ToolDefinition => ({
  name: "edit_file",
  description: `Make edits to a text file.
Replaces 'old_str' with 'new_str' in the given file. 'old_str' and 'new_str' MUST be different from each other.
If the file specified with path doesn't exist, it will be created.`,
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the file",
      },
      old_str: {
        type: "string",
        description: "Text to search for",
      },
      new_str: {
        type: "string",
        description: "Text to replace old_str with",
      },
    },
    required: ["path", "old_str", "new_str"],
    additionalProperties: false,
  },
  function: async ({
    path,
    old_str,
    new_str,
  }: {
    path: string;
    old_str: string;
    new_str: string;
  }) => {
    if (!path || old_str === new_str) {
      return "❌ Invalid input parameters.";
    }

    try {
      // Get the current file system state and update functions
      const fileExplorerStore = useFileExplorerStore.getState();
      const fileSystem = fileExplorerStore.fileSystem;
      
      // Normalize path
      const normalizedPath = path.startsWith('./') 
        ? `/project${path.substring(1)}` 
        : path.startsWith('/') 
          ? path 
          : `/project/${path}`;
      
      // Find the file
      const file = findItemByPath(fileSystem, normalizedPath);
      
      // If file doesn't exist and old_str is empty, create a new file
      if (!file && old_str === "") {
        // Extract parent path and filename
        const pathParts = normalizedPath.split('/');
        const fileName = pathParts.pop() || '';
        const parentPath = pathParts.join('/');
        
        // Find parent directory
        const parentDir = findItemByPath(fileSystem, parentPath);
        
        if (!parentDir || parentDir.type !== 'folder') {
          return `❌ Failed to create file: Parent directory not found`;
        }
        
        // Add new file
        fileExplorerStore.addFile(parentPath, fileName);
        
        // Get the newly created file and update its content
        const newFileSystem = fileExplorerStore.fileSystem;
        const newFile = findItemByPath(newFileSystem, normalizedPath);
        
        if (newFile && newFile.type === 'file') {
          fileExplorerStore.updateFileContent(newFile.id, new_str);
          return `✅ Created new file at ${path}`;
        } else {
          return `❌ Failed to create file`;
        }
      }
      
      // Edit existing file
      if (file && file.type === 'file') {
        const content = file.content || '';
        
        if (!content.includes(old_str)) {
          return "❌ old_str not found in file.";
        }
        
        const newContent = content.replace(new RegExp(old_str, 'g'), new_str);
        fileExplorerStore.updateFileContent(file.id, newContent);
        
        return "✅ File edited successfully.";
      }
      
      return `❌ Error: File not found or is not a file`;
    } catch (err) {
      return `❌ Error editing file: ${(err as Error).message}`;
    }
  },
});