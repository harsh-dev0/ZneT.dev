"use client"
import React from 'react';
import Sidebar from '../Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="hidden md:block h-full">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
