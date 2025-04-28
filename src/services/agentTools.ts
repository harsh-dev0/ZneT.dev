import {
  FileSystemItem,
  useFileExplorerStore,
} from "@/store/fileExplorerStore"

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: Record<string, any>
    required: string[]
    additionalProperties: boolean
  } // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function: (input: any) => Promise<string>
}

const normalizePath = (path: string): string => {
  if (!path) return "/project"
  let normalized = path
  if (normalized.startsWith("./")) {
    normalized = `/project${normalized.substring(1)}`
  } else if (normalized.startsWith("/")) {
    normalized = normalized
  } else {
    normalized = `/project/${normalized}`
  }

  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}

const findItemByPath = (
  items: FileSystemItem[],
  path: string
): FileSystemItem | null => {
  const normalizedPath = normalizePath(path)

  for (const item of items) {
    if (item.path === normalizedPath) return item
    if (item.children) {
      const found = findItemByPath(item.children, normalizedPath)
      if (found) return found
    }
  }
  const pathLower = normalizedPath.toLowerCase()
  for (const item of items) {
    if (item.path.toLowerCase() === pathLower) return item
    if (item.children) {
      const found = item.children.find(
        (child) => child.path.toLowerCase() === pathLower
      )
      if (found) return found
      const deepFound = findItemByPath(item.children, normalizedPath)
      if (deepFound) return deepFound
    }
  }

  return null
}

const findItemByName = (
  items: FileSystemItem[],
  name: string
): FileSystemItem | null => {
  const nameLower = name.toLowerCase()

  for (const item of items) {
    if (item.name.toLowerCase() === nameLower) return item
  }

  for (const item of items) {
    if (item.children && item.children.length > 0) {
      const found = findItemByName(item.children, name)
      if (found) return found
    }
  }

  return null
}

export const createReadFileTool = (): ToolDefinition => ({
  name: "read_file",
  description:
    "Reads the contents of a file at a given relative path. Only use for text files.",
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
      const fileSystem = useFileExplorerStore.getState().fileSystem

      let file = findItemByPath(fileSystem, path)
      if (!file && path.indexOf("/") === -1) {
        file = findItemByName(fileSystem, path)
      }

      if (!file) {
        return `❌ Error reading file: File not found at path ${path}`
      }

      if (file.type !== "file") {
        return `❌ Error reading file: ${path} is not a file`
      }

      return file.content || ""
    } catch (e) {
      return `❌ Error reading file: ${(e as Error).message}`
    }
  },
})

export const createListFilesTool = (): ToolDefinition => ({
  name: "list_files",
  description:
    "Lists files and directories at a given path. Defaults to '.' if no path provided.",
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
      const fileSystem = useFileExplorerStore.getState().fileSystem

      let dir = findItemByPath(fileSystem, path)

      if (!dir && path && path !== "." && path.indexOf("/") === -1) {
        dir = findItemByName(fileSystem, path)
      }

      if (!dir) {
        return `❌ Error listing files: Directory not found at path ${path}`
      }

      if (dir.type !== "folder") {
        return `❌ Error listing files: ${path} is not a directory`
      }

      const list =
        dir.children?.map((item) =>
          item.type === "folder" ? `${item.name}/` : item.name
        ) || []

      return JSON.stringify(list, null, 2)
    } catch (e) {
      return `❌ Error listing files: ${(e as Error).message}`
    }
  },
})

export const createEditFileTool = (): ToolDefinition => ({
  name: "edit_file",
  description:
    "Edit an existing file by replacing text. The file must already exist.",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the existing file to edit",
      },
      old_str: {
        type: "string",
        description: "Text to search for and replace",
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
    path: string
    old_str: string
    new_str: string
  }) => {
    if (!path || old_str === new_str) {
      return "❌ Invalid input parameters. Path is required and old_str must be different from new_str."
    }

    try {
      const fileExplorerStore = useFileExplorerStore.getState()
      const fileSystem = fileExplorerStore.fileSystem
      const normalizedPath = normalizePath(path)

      const file = findItemByPath(fileSystem, normalizedPath)

      if (!file) {
        return `❌ Error: File not found at path ${path}. Use create_file to create a new file.`
      }

      if (file.type !== "file") {
        return `❌ Error: ${path} is not a file`
      }

      const content = file.content || ""

      if (!content.includes(old_str)) {
        return `❌ String "${old_str}" not found in file. Please verify file content using read_file before editing.`
      }

      const newContent = content.replace(new RegExp(old_str, "g"), new_str)
      fileExplorerStore.updateFileContent(file.id, newContent)

      return "✅ File edited successfully."
    } catch (err) {
      return `❌ Error editing file: ${(err as Error).message}`
    }
  },
})

export const createCreateFileTool = (): ToolDefinition => ({
  name: "create_file",
  description:
    "Create a new file with the given content. If file exists, it will be overwritten.",
  inputSchema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the file to create",
      },
      content: {
        type: "string",
        description: "Content to write to the file",
      },
    },
    required: ["path", "content"],
    additionalProperties: false,
  },
  function: async ({
    path,
    content,
  }: {
    path: string
    content: string
  }) => {
    if (!path) {
      return "❌ Invalid input parameters. Path is required."
    }

    try {
      const fileExplorerStore = useFileExplorerStore.getState()
      const fileSystem = fileExplorerStore.fileSystem

      const normalizedPath = normalizePath(path)
      const pathParts = normalizedPath.split("/")
      const fileName = pathParts.pop() || ""
      const parentPath = pathParts.join("/")

      const parentDir = findItemByPath(fileSystem, parentPath)

      if (!parentDir || parentDir.type !== "folder") {
        return `❌ Failed to create file: Parent directory not found at ${parentPath}`
      }

      const existingFile = findItemByPath(fileSystem, normalizedPath)

      if (existingFile) {
        if (existingFile.type === "file") {
          fileExplorerStore.updateFileContent(existingFile.id, content)
          return `✅ Updated existing file at ${path}`
        } else {
          return `❌ Cannot create file: Path ${path} exists but is a directory`
        }
      }

      fileExplorerStore.addFile(parentPath, fileName)

      const newFileSystem = fileExplorerStore.fileSystem
      const newFile = findItemByPath(newFileSystem, normalizedPath)

      if (newFile && newFile.type === "file") {
        fileExplorerStore.updateFileContent(newFile.id, content)
        return `✅ Created new file at ${path}`
      } else {
        return `❌ Failed to create file`
      }
    } catch (err) {
      return `❌ Error creating file: ${(err as Error).message}`
    }
  },
})
