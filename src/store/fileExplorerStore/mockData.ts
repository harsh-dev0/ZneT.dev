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
import Footer from './components/Footer';

function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center">
      <p className="mb-4 text-4xl font-bold text-blue-500">Example Counter</p>
        <p className="mb-4 text-4xl font-bold text-blue-500">{count}</p>
        <button
          onClick={() => setCount(count + 1)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Click me!
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default App;`,
          },
          {
            id: 'folder-3',
            name: 'components',
            type: 'folder',
            expanded: true,
            path: '/project/src/components',
            children: [
              {
                id: 'file-footer',
                name: 'Footer.jsx',
                type: 'file',
                path: '/project/src/components/Footer.jsx',
                content: `import React from 'react';

function Footer() {
  return (
    <footer className="w-full py-4 bg-gray-100 text-center text-gray-500 border-t space-y-2">
      <span>See App.jsx to learn how imports work in this project.</span>
    </footer>
  );
}

export default Footer;`,
              },
            ],
          },
          {
            id: 'file-2',
            name: 'index.jsx',
            type: 'file',
            path: '/project/src/index.jsx',
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
