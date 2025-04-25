import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, XCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMessageStore } from '@/store/messageStore';
import MessageBubble from '@/components/ui/MessageBubble';
import ApiKeyForm from '@/components/ui/ApiKeyForm';
import agentService from '@/services/agentService';
import { 
  createReadFileTool, 
  createListFilesTool, 
  createEditFileTool 
} from '@/services/agentTools';

const AgentPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { messages, addMessage, isLoading, setLoading, clearMessages } = useMessageStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      agentService.registerTools([
        createReadFileTool(),
        createListFilesTool(),
        createEditFileTool()
      ]);
      setIsInitialized(true);
    }
  }, [isInitialized]);
  
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
    
    if (!agentService.getApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please set your Groq API key first",
        variant: "destructive",
      });
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: prompt,
      timestamp: new Date(),
    };
    
    addMessage(userMessage);
    setPrompt('');
    setLoading(true);
    
    try {
      await agentService.sendMessage(prompt);
      const conversation = agentService.getConversation();
      const newMessages = conversation.filter(
        msg => msg.timestamp > userMessage.timestamp
      );
      
      // Add all new messages to our store
      for (const msg of newMessages) {
        addMessage(msg);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to get agent response",
        variant: "destructive",
      });
      console.error("Agent error:", error);
      
      // Add error message
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const isUsingDefaultKey = agentService.isUsingDefaultKey();
  const hasApiKey = !!agentService.getApiKey();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg mr-3">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">AI Agent</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white"
            onClick={() => {
              clearMessages();
              agentService.clearConversation();
            }}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <ApiKeyForm />
        </div>
      </div>
      
      {isUsingDefaultKey && hasApiKey && (
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border-b border-zinc-700/50 text-sm">
          <Info className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <p className="text-zinc-300">
            Using default API key with rate limits. 
            <ApiKeyForm onSuccess={() => toast({ title: "API Key updated" })} />
          </p>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id + '-' + idx} message={msg} />
        ))}
        <div ref={messagesEndRef} />
        
        {isLoading && !messages.some(m => m.content.includes('<tool_call>')) && (
          <div className="flex justify-start px-4 py-2">
            <div className="bg-zinc-800/50 text-zinc-300 rounded-lg px-4 py-2 flex items-center space-x-2">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-sm font-medium">Thinking...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-zinc-800 bg-black/40">
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
            className="flex-1 min-h-[80px] max-h-[160px] bg-zinc-800/50 border-zinc-700 focus:border-purple-500 placeholder:text-zinc-500 text-white resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim() || !hasApiKey}
            className="self-end bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AgentPanel;