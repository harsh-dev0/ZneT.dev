"use client"
import React from 'react';
import Editor from '@monaco-editor/react';
import { FileSystemItem, useFileExplorerStore } from '@/store/fileExplorerStore';
import { useTabStore } from '@/store/tabStore';
import EmptyState from './EmptyState';
import Preview from './Preview';
import EditorTabStrip from './EditorTabStrip';

interface CodeEditorProps {
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ className }) => {
  const [view,] = React.useState<'code' | 'preview'>('code');
  const fileSystem = useFileExplorerStore((state) => state.fileSystem);
  const activeFileId = useFileExplorerStore((state) => state.activeFileId);
  const updateFileContent = useFileExplorerStore((state) => state.updateFileContent);
  const { openTab } = useTabStore();

  const findFileById = (id: string | null) => {
    if (!id) return null;

    const findInItems = (items: FileSystemItem[]): FileSystemItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInItems(fileSystem);
  };

  const activeFile = findFileById(activeFileId);

  React.useEffect(() => {
    if (activeFile && activeFile.type === 'file') {
      openTab({ id: activeFile.id, name: activeFile.name });
    }
  }, [activeFileId, activeFile, openTab]);

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };

  const getLanguage = (fileName: string) => {
    if (!fileName) return 'plaintext';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <EditorTabStrip />
      <div className="flex-1">
        {activeFile?.type === 'file' ? (
          view === 'code' ? (
            <Editor
              height="100%"
              defaultLanguage={getLanguage(activeFile.name)}
              value={activeFile.content}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          ) : (
            <Preview />
          )
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default CodeEditor;