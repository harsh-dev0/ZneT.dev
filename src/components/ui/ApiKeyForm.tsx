import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key } from 'lucide-react';
import agentService from '@/services/agentService';

interface ApiKeyFormProps {
  onSuccess?: () => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  
  const existingKey = agentService.getApiKey();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }
    
    try {
      agentService.setApiKey(apiKey);
      setError('');
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError((err as Error).message);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={existingKey ? "outline" : "secondary"} 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Key className="h-4 w-4" />
          {existingKey ? "Change API Key" : "Set API Key"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set your Groq API Key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To use the AI agent, you need to provide a Groq API key. 
              Your key will be stored locally in your browser.
            </p>
            <Input
              type="password"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Don't have a key? Get one from{' '}
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Groq's console
              </a>.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyForm;