import { ToolDefinition } from './agentTools';

export type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type Conversation = Message[];

const SYSTEM_PROMPT = `
You are an expert coding assistant for the ZneT IDE with access to filesystem tools.
When responding, use markdown formatting to improve readability.
For code blocks, always specify the language.

Important Guidelines:
1. Be proactive and helpful - make assumptions that help the user rather than asking clarifying questions.
2. When user mentions a file or folder without specifying a full path, assume they want to work with that file/folder anywhere in the project.
3. When the user asks about UI elements, components, or specific features, automatically search for relevant files without asking.
4. Use the tools efficiently - search first, then read files, then edit as needed.
5. Only use the tools when needed to answer the question - don't use tools if you can answer directly.
6. Explain your reasoning clearly and concisely.

Before calling each tool, briefly explain why you're using it. 
After receiving the tool result, continue your assistance based on the new information.
`.trim();

class AgentService {
  private apiKey: string | null = null;
  private isDefaultKey: boolean = false;
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
    // Try to load API key from localStorage first
    if (typeof window !== 'undefined' && window.localStorage) {
      this.apiKey = localStorage.getItem('groq_api_key');
    }
    
    // If no key in localStorage, try to use default key from env
    if (!this.apiKey && process.env.NEXT_PUBLIC_DEFAULT_GROQ_API_KEY) {
      this.apiKey = process.env.NEXT_PUBLIC_DEFAULT_GROQ_API_KEY;
      this.isDefaultKey = true;
    }
  }
  
  setApiKey(key: string) {
    this.apiKey = key;
    this.isDefaultKey = false;
    localStorage.setItem('groq_api_key', key);
  }
  
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  isUsingDefaultKey(): boolean {
    return this.isDefaultKey;
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
        let errorMsg = error.error?.message || 'Failed to get response from API';
        
        // Add default key specific error message
        if (this.isDefaultKey && (errorMsg.includes('rate limit') || errorMsg.includes('quota'))) {
          errorMsg += ' (Using default API key - set your own key for unlimited usage)';
        }
        
        throw new Error(errorMsg);
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
}

// Create a singleton instance
const agentService = new AgentService();

export default agentService;