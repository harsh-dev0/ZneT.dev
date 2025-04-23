"use client"
import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import CodeEditor from '@/components/Editor';
import Preview from '@/components/Preview';
import AgentPanel from '@/components/AgentPanel';
import { Button } from '@/components/ui/button';
import { Code, Eye } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const [view, setView] = useState<'code' | 'preview'>('code');

  return (
    <MainLayout>
      <div className="md:hidden flex flex-col h-screen w-screen bg-card">
        <div className="h-12 flex items-center justify-center bg-primary text-primary-foreground text-lg font-bold shadow-sm border-b border-border">
          ZneT Dev
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-muted text-card-foreground px-6 py-4 rounded-lg shadow font-semibold text-center text-base max-w-xs mx-auto border border-border">
            For the best experience, please use ZneT Dev on a large screen or PC.<br />The UI works best on desktops, similar to modern code editors.
          </div>
        </div>
      </div>
      <div className="hidden md:flex flex-col h-full">
        <div className="h-12 border-b flex items-center px-4 bg-card justify-between">
          <h1 className="text-lg font-bold">ZneT Dev</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant={view === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('code')}
            >
              <Code className="h-4 w-4 mr-1" />
              Code
            </Button>
            <Button
              variant={view === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('preview')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={70} minSize={30}>
              {view === 'code' ? <CodeEditor /> : <Preview />}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20}>
              <AgentPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
