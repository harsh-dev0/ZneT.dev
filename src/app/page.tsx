import React from 'react'
import CodeEditor from '@/components/Editor'
import MainLayout from '@/components/layouts/MainLayout';

const Index = () => {
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="h-12 border-b flex items-center px-4 bg-card">
          <h1 className="text-lg font-bold">ZneT Code Forge</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <CodeEditor />
        </div>
      </div>
      </MainLayout>
    
  );
};

export default Index;
