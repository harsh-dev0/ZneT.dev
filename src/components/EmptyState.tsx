import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-znet-accent/10 p-8 rounded-lg border border-znet-border max-w-xl">
        <h3 className="text-xl font-medium mb-4 text-znet-accent">Welcome to ZneT</h3>
        <p className="text-muted-foreground mb-4">
          Your AI-first IDE for bootstrapping solo development projects
        </p>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">🔍 Select a file from the explorer to begin editing</p>
          <p className="mb-2">💬 Use the agent panel to generate code with AI</p>
          <p>🚀 Toggle between code and preview modes in the top bar</p>
        </div>
        <div className="mt-6 text-xs text-muted-foreground">
          <div className="animate-bounce-horizontal inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M19 12H5"></path>
              <path d="m12 19-7-7 7-7"></path>
            </svg>
            <span>Start by selecting a file</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
