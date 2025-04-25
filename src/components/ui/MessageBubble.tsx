import React from 'react';
import { Message } from '@/services/agentService';
import { cn } from '@/lib/utils';
import { FileCode2, User, Bot, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUserOrTool = message.role === 'user';
  const isSystem = message.role === 'system';
  
  const formatTimestamp = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    if (typeof window !== 'undefined') {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return messageDate.toISOString().slice(11, 16); // HH:mm in UTC
    }
  };

  // Parse tool calls and results
  const parseToolContent = (content: string) => {
    const toolCallMatch = content.match(/<\/tool_call>/);
    if (toolCallMatch) {
      try {
        const toolData = JSON.parse(toolCallMatch[1]);
        const action = content.split('')[0].trim();
        return {
          type: 'tool-call',
          action,
          tool: toolData.name,
          input: toolData.input
        };
      } catch (error) {
        console.error('Error parsing tool call:', error);
        
      }
    }

    if (content.startsWith('Tool result:')) {
      return {
        type: 'tool-result',
        result: content.replace('Tool result:', '').trim()
      };
    }

    return null;
  };

  const toolContent = parseToolContent(message.content);

  if (toolContent?.type === 'tool-call') {
    let status = 'Processing...';
    if (toolContent.tool === 'list_files') status = 'Searching...';
    else if (toolContent.tool === 'read_file') status = 'Reading...';
    else if (toolContent.tool === 'edit_file') status = 'Editing...';
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400">
        <FileCode2 className="w-4 h-4" />
        <span>{status}</span>
      </div>
    );
  }

  if (toolContent?.type === 'tool-result') {
    return (
      <div className="px-4 py-2 text-sm">
        <div className="flex items-center gap-2 mb-1 text-zinc-400">
          <Terminal className="w-4 h-4" />
          <span>Output</span>
        </div>
        <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">
          {toolContent.result}
        </pre>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="px-4 py-3 text-center text-sm text-zinc-400">
        {message.content}
      </div>
    );
  }

  return (
    <div className={cn(
      'group flex items-start gap-3 px-4 py-2 hover:bg-zinc-800/30',
      isUserOrTool ? 'flex-row-reverse' : 'flex-row'
    )}>
      <div className={cn(
        'flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md',
        isUserOrTool ? 'bg-blue-500' : 'bg-purple-500'
      )}>
        {isUserOrTool ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code(props: React.ComponentProps<'code'> & {inline?: boolean}) {
                const {inline, children, ...rest} = props;
                return inline ? (
                  <code className="px-1 py-0.5 rounded bg-zinc-800 font-mono text-sm" {...rest}>
                    {children}
                  </code>
                ) : (
                  <pre className="p-3 rounded-md bg-zinc-800 overflow-x-auto">
                    <code className="font-mono text-sm" {...rest}>
                      {children}
                    </code>
                  </pre>
                );
              },
              p({children, ...props}) {
                if (
                  Array.isArray(children) &&
                  children.length === 1 &&
                  typeof children[0] === 'object' &&
                  children[0]?.type === 'pre'
                ) {
                  return children[0];
                }
                return <p {...props}>{children}</p>;
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;