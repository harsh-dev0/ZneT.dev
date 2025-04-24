"use client"
import React, { useEffect, useState } from 'react';
import { useFileExplorerStore } from '@/store/fileExplorerStore';

type FileItem = {
  type: 'file' | 'directory' | 'folder';
  path: string;
  content?: string;
  children?: FileItem[];
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

function buildVFS(files: FileItem[]): Record<string, string> {
  const vfs: Record<string, string> = {};
  function walk(items: FileItem[]) {
    for (const item of items) {
      if (item.type === 'file' && typeof item.content === 'string') {
        vfs[item.path] = item.content;
      } else if (item.children) {
        walk(item.children);
      }
    }
  }
  walk(files);
  return vfs;
}

const Preview: React.FC = () => {
  const fileSystem = useFileExplorerStore((state) => state.fileSystem);
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generatePreview = async () => {
      setIsLoading(true);
      try {
        const vfs = buildVFS(fileSystem);
        const entryPath = Object.keys(vfs).find(
          k => k.endsWith('index.jsx') || k.endsWith('index.js')
        );
        if (!entryPath) {
          setHtml('<div style="padding:20px">No index.jsx entry file found</div>');
          setIsLoading(false);
          return;
        }
        const vfsJson = JSON.stringify(vfs).replace(/<\//g, '<\/');
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
              <script type="text/javascript">
                window.__VFS__ = ${vfsJson};
                window.__MODULE_CACHE__ = {};
                window.__resolve = function(path) {
                  if (window.__MODULE_CACHE__[path]) return window.__MODULE_CACHE__[path].exports;
                  var code = window.__VFS__[path];
                  if (!code) throw new Error('Module not found: ' + path);
                  var exports = {};
                  var module = { exports };
                  function require(relPath) {
                    if (relPath === 'react') return window.React;
                    if (relPath === 'react-dom') return window.ReactDOM;
                    if (relPath === 'react-dom/client') return { createRoot: window.ReactDOM.createRoot };
                    var base = path.substring(0, path.lastIndexOf('/'));
                    var fullPath = relPath;
                    if (!relPath.startsWith('/')) {
                      if (relPath.startsWith('.')) {
                        fullPath = base + '/' + relPath;
                      } else {
                        fullPath = base + '/' + relPath;
                      }
                    }
                    // Normalize path (remove .., .)
                    var segments = fullPath.split('/');
                    var normalized = [];
                    for (var seg of segments) {
                      if (seg === '' || seg === '.') continue;
                      if (seg === '..') normalized.pop(); else normalized.push(seg);
                    }
                    fullPath = '/' + normalized.join('/');
                    if (!fullPath.endsWith('.js') && !fullPath.endsWith('.jsx')) fullPath += '.jsx';
                    return window.__resolve(fullPath);

                  }
                  var transpiled = Babel.transform(code, { presets: ['react', 'env'] }).code;
                  var fn = new Function('require', 'exports', 'module', transpiled);
                  fn(require, exports, module);
                  window.__MODULE_CACHE__[path] = module;
                  return module.exports;
                };
                window.onload = function() {
                  try {
                    var App = window.__resolve('${entryPath}').default || window.__resolve('${entryPath}');
                    var root = ReactDOM.createRoot(document.getElementById('root'));
                    root.render(React.createElement(App));
                  } catch (err) {
                    document.getElementById('root').innerHTML = '<div class="preview-error">'+err+'</div>';
                  }
                };
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
          key={btoa(unescape(encodeURIComponent(html))).slice(0,16)}
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
