"use client"
import React, { useState, useEffect } from 'react';
import { useFileExplorerStore } from '@/store/fileExplorerStore';
import MainLayout from '@/components/layouts/MainLayout';
import CodeEditor from '@/components/Editor';
import Preview from '@/components/Preview';
import AgentPanel from '@/components/AgentPanel';
import { Button } from '@/components/ui/button';
import { Code, Eye } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'znet_files';
const Index = () => {
  const { toast } = useToast();
  const [view, setView] = useState<'code' | 'preview'>('code');
  const fileSystem = useFileExplorerStore((s) => s.fileSystem);
  const saveFilesAction = useFileExplorerStore((s) => s.saveFiles);
  const resetFilesAction = useFileExplorerStore((s) => s.resetFiles);
  const saveFiles = () => { saveFilesAction(); toast({ title: 'Files saved successfully' }); };
  const resetFiles = () => { resetFilesAction(); toast({ title: 'Files reset successfully' }); };
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data)) {
          useFileExplorerStore.setState({ fileSystem: data });
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fileSystem));
  }, [fileSystem]);

  return (
    <MainLayout>
      <div className="md:hidden flex flex-col h-screen w-screen bg-card">
        <div className="h-12 flex items-center justify-center bg-black text-white text-lg font-bold shadow-sm border-b border-border">
          <h1 className="ml-2 font-bold text-lg text-znet-accent">ZneT <span className="text-sm font-normal text-gray-300">AI-First IDE</span></h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-muted text-card-foreground px-6 py-4 rounded-lg shadow font-semibold text-center text-base max-w-xs mx-auto border border-border">
            For the best experience, please use ZneT Dev on a large screen or PC.<br />The UI works best on desktops, similar to modern code editors.
          </div>
        </div>
      </div>
      <div className="hidden md:flex flex-col h-full">
        <div className="h-12 border-b flex items-center px-4 bg-card justify-between">
          <h1 className="ml-2 font-bold text-lg text-znet-accent">ZneT <span className="text-sm font-normal text-gray-300">AI-First IDE</span></h1>
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
            <Button
              variant="outline"
              size="sm"
              onClick={saveFiles}
            >
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFiles}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={70} minSize={30}>
              {view === 'code' ? <CodeEditor /> : <Preview key={JSON.stringify(fileSystem)} />}
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