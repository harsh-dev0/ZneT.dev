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
        expanded: true,
        path: '/project/src',
        children: [
          {
            id: 'file-1',
            name: 'App.jsx',
            type: 'file',
            path: '/project/src/App.jsx',
            content: `import React from 'react';

function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">React Counter Example</h1>
        <p className="mb-4 text-4xl font-bold text-blue-500">{count}</p>
        <button
          onClick={() => setCount(count + 1)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Click me!
        </button>
      </div>
    </div>
  );
}

export default App;`,
          },
          {
            id: 'file-2',
            name: 'index.jsx',
            type: 'file',
            path: '/project/src/index.jsx',
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
const App = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">React Counter Example</h1>
        <p className="mb-4 text-4xl font-bold text-blue-500">{count}</p>
        <button
          onClick={() => setCount(count + 1)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Click me!
        </button>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
          },
          {
            id: 'file-3',
            name: 'styles.css',
            type: 'file',
            path: '/project/src/styles.css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
          },
        ],
      },
      {
        id: 'file-4',
        name: 'package.json',
        type: 'file',
        path: '/project/package.json',
        content: `{
  "name": "react-preview",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
      },
    ],
  },
];
