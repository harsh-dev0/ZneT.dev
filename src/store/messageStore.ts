import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from '@/services/agentService';

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      messages: [
        {
          id: '0',
          role: 'system',
          content: 'Welcome to ZneT Code Forge! Ask me anything about your code or request changes to your project.',
          timestamp: new Date(),
        },
      ],
      isLoading: false,
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      clearMessages: () => set({ 
        messages: [
          {
            id: '0',
            role: 'system',
            content: 'Welcome to ZneT Code Forge! Ask me anything about your code or request changes to your project.',
            timestamp: new Date(),
          },
        ] 
      }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'znet-agent-messages',
    }
  )
);