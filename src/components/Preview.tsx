"use client"
import React, { useEffect, useState } from 'react';
import { useFileExplorerStore } from '@/store/fileExplorerStore';

type FileItem = {
  type: 'file' | 'directory' | 'folder';
  path: string;
  content?: string;
  children?: FileItem[];
};

const flattenFileSystem = (items: FileItem[]): FileItem[] => {
  let files: FileItem[] = [];
  for (const item of items) {
    if (item.type === 'file') {
      files.push(item);
    } else if (item.children) {
      files = files.concat(flattenFileSystem(item.children));
    }
  }
  return files;
};

const sanitizeJsxForPreview = (content: string): string => {
    return content
      .split('\n')
      .filter(line => !line.trim().startsWith('import'))
      .map(line => line.replace(/^export\s+default\s+/, 'window.App = '))
      .join('\n');
  };
  

const Preview: React.FC = () => {
  const fileSystem = useFileExplorerStore((state) => state.fileSystem);
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generatePreview = async () => {
      setIsLoading(true);

      try {
        const allFiles = flattenFileSystem(fileSystem);
        const jsxFiles = allFiles.filter(file =>
          file.type === 'file' &&
          typeof file.content === 'string' &&
          (file.path.endsWith('.jsx') || file.path.endsWith('.js'))
        );

        const entryFile = jsxFiles.find(file => file.path.endsWith('index.jsx'));

        if (!entryFile) {
          setHtml('<div style="padding:20px">No index.jsx entry file found</div>');
          setIsLoading(false);
          return;
        }

        const cleanedCode = sanitizeJsxForPreview(entryFile.content!);

        const previewHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                body { margin: 0; padding: 0; font-family: sans-serif; }
                .preview-error { padding: 20px; color: red; font-family: monospace; }
                .loading { padding: 20px; text-align: center; }
              </style>
              <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
              <script src="https://unpkg.com/@babel/standalone@7.22.5/babel.min.js" crossorigin></script>
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
              <div id="root">
                <div class="loading">Loading preview...</div>
              </div>
              <script type="text/babel">
                ${cleanedCode}

                document.addEventListener('DOMContentLoaded', () => {
                  setTimeout(() => {
                    try {
                      const Component = window.App;
                      if (!Component) throw new Error("Component not found (expected window.App)");
                      const root = ReactDOM.createRoot(document.getElementById('root'));
                      root.render(React.createElement(Component));
                    } catch (err) {
                      console.error('Render error:', err);
                      document.getElementById('root').innerHTML = 
                        \`<div class="preview-error">
                          <h3>Render error:</h3>
                          <pre>\${err.message}</pre>
                          <p>Check the console for details</p>
                        </div>\`;
                    }
                  }, 100);
                });
              </script>
            </body>
          </html>
        `;

        setHtml(previewHtml);
      } catch (err) {
        console.error('Preview generation error:', err);
        setHtml(`<div style="padding:20px;color:red">Error generating preview: ${(err as Error).message}</div>`);
      }

      setIsLoading(false);
    };

    generatePreview();

  }, [fileSystem]);

  return (
    <div className="w-full h-full bg-background">
      {isLoading ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center p-4">
            <h3 className="text-lg font-medium mb-2">Loading Preview</h3>
            <p>Preparing code for preview...</p>
          </div>
        </div>
      ) : html ? (
        <iframe
          srcDoc={html}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-popups allow-modals"
          title="Preview"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center p-4">
            <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
            <p>Create React components to see a preview</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Preview;
