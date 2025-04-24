import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFileExplorerStore } from '@/store/fileExplorerStore';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

const AgentPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'system',
      content: 'Welcome to ZneT Code Forge! Ask me anything about your code or request changes to your project.',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const fileSystem = useFileExplorerStore((state) => state.fileSystem);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fileNames = fileSystem
        .filter(item => item.type === 'file')
        .map(item => item.path)
        .join(', ');
      
      const responseContent = `I see you're working on a project with files: ${fileNames.substring(0, 100)}${fileNames.length > 100 ? '...' : ''}. 
      
How can I help with your code? You can ask me to:
- Explain parts of the codebase
- Suggest improvements
- Help fix bugs
- Generate new components`;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      toast({
        title: "Success",
        description: "Agent response received",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get agent response",
        variant: "destructive",
      });
      console.error("Agent error:", error);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const formatTimestamp = (date: Date) => {
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return time.replace(/([ap])m$/i, (m) => m.toUpperCase());
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
        <h2 className="text-lg font-semibold">AI Agent</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`rounded-lg px-4 py-2 max-w-[85%] ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : msg.role === 'system' 
                    ? 'bg-muted text-muted-foreground' 
                    : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {formatTimestamp(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 flex items-center space-x-2">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <form 
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about your code..."
            className="flex-1 min-h-[80px] max-h-[160px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AgentPanel;