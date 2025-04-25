import { ToolDefinition } from './agentTools';

export type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type Conversation = Message[];

const SYSTEM_PROMPT = `
You are an AI assistant with access to three tools:
Only use these tools whenever you think it will help the query

When responding, use markdown formatting to improve readability.
For code blocks, always specify the language.

Before calling each tool, first explain to the USER why you are calling it.
After the tool result, you will get that output as a user message. Then continue reasoning or call another tool.
If you do _not_ need a tool, just reply normally.
`.trim();

class AgentService {
  private apiKey: string | null = null;
  private tools: ToolDefinition[] = [];
  private conversation: Conversation = [
    {
      id: 'system-1',
      role: 'system',
      content: SYSTEM_PROMPT,
      timestamp: new Date(),
    }
  ];
  
  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
    this.apiKey = localStorage.getItem('groq_api_key');
    } else {
      this.apiKey = null;
    }
  }
  
  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('groq_api_key', key);
  }
  
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  registerTools(tools: ToolDefinition[]) {
    this.tools = tools;
    
    // Update system prompt with tool descriptions
    const toolDescriptions = tools.map(tool => {
      return `${tool.name}
   • Description: ${tool.description}
   • Input schema: ${JSON.stringify(tool.inputSchema)}`;
    }).join('\n\n');
    
    this.conversation[0].content = `
${SYSTEM_PROMPT}

You have access to the following tools:
${toolDescriptions}

Example:
<tool_call>
{"name":"list_files","input":{"path":"./"}}
</tool_call>
`.trim();
  }
  
  getConversation(): Conversation {
    return this.conversation;
  }
  
  addMessage(message: Message) {
    this.conversation.push(message);
  }
  
  clearConversation() {
    this.conversation = [this.conversation[0]]; // Keep system message
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseToolCall(text: string): { name: string; input: any} | null {
    const match = text.match(/<tool_call>([\s\S]*?)<\/tool_call>/);
    if (!match) return null;
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  
  async sendMessage(userMessage: string): Promise<Message> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }
    
    // Add user message to conversation
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    this.conversation.push(userMsg);
    
    try {
      // For demo/development, use mock API response
      if (process.env.NODE_ENV === 'development' && !this.apiKey.startsWith('gsk_')) {
        return await this.getMockResponse(userMessage);
      }
      
      // Prepare conversation for API
      const messages = this.conversation.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Call API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages,
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get response from API');
      }
      
      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content;
      
      // Check if the response contains a tool call
      const toolCall = this.parseToolCall(assistantContent);
      
      const finalContent = assistantContent;
      
      if (toolCall) {
        // Find the tool
        const tool = this.tools.find(t => t.name === toolCall.name);
        
        if (tool) {
          // Add assistant message with tool call
          const assistantMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
          };
          this.conversation.push(assistantMsg);
          
          // Execute the tool
          const result = await tool.function(toolCall.input);
          
          // Add tool result as user message
          const toolResultMsg: Message = {
            id: Date.now().toString() + '-tool',
            role: 'user',
            content: `Tool result:\n${result}`,
            timestamp: new Date(),
          };
          this.conversation.push(toolResultMsg);
          
          // Get a follow-up response from the API
          return await this.sendMessage(''); // Empty message to get follow-up
        }
      }
      
      // Add assistant message to conversation
      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: finalContent,
        timestamp: new Date(),
      };
      
      this.conversation.push(assistantMsg);
      
      return assistantMsg;
    } catch (error) {
      // Add error message to conversation
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        timestamp: new Date(),
      };
      
      this.conversation.push(errorMsg);
      
      return errorMsg;
    }
  }
  
  // Mock response for development/demo
  private async getMockResponse(userMessage: string): Promise<Message> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    let content = '';
    
    if (userMessage.toLowerCase().includes('list files')) {
      content = 'I\'ll check what files are in the project.\n\n<tool_call>\n{"name":"list_files","input":{"path":"/project"}}\n</tool_call>';
      
      // Auto-execute the tool call for demo
      const tool = this.tools.find(t => t.name === 'list_files');
      if (tool) {
        const result = await tool.function({ path: '/project' });
        
        // Add tool result as user message
        const toolResultMsg: Message = {
          id: Date.now().toString() + '-tool',
          role: 'user',
          content: `Tool result:\n${result}`,
          timestamp: new Date(),
        };
        this.conversation.push(toolResultMsg);
        
        // Return a follow-up response
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I've listed the files in your project. You have the following files and directories:\n\n\`\`\`json\n${result}\n\`\`\`\n\nIs there anything specific you'd like to know about these files?`,
          timestamp: new Date(),
        };
      }
    } else if (userMessage.toLowerCase().includes('read') && userMessage.toLowerCase().includes('app')) {
      content = 'Let me read the App.jsx file to see its contents.\n\n<tool_call>\n{"name":"read_file","input":{"path":"/project/src/App.jsx"}}\n</tool_call>';
    } else if (userMessage.toLowerCase().includes('edit') || userMessage.toLowerCase().includes('change')) {
      content = 'I\'ll edit that file for you.\n\n<tool_call>\n{"name":"edit_file","input":{"path":"/project/src/App.jsx","old_str":"Example Counter","new_str":"Awesome Counter"}}\n</tool_call>';
    } else {
      content = `I understand you're asking about "${userMessage}". As your coding assistant, I can help with various tasks:

1. Read code files to understand their content
2. List files in directories to navigate the project
3. Edit files to make changes you request

Let me know what specific task you'd like me to help with!`;
    }
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
  }
}

// Create a singleton instance
const agentService = new AgentService();

export default agentService;