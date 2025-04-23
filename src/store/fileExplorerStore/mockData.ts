import { FileSystemItem } from './types';

export const initialFileSystem: FileSystemItem[] = [
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