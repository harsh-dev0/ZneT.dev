import React from 'react';
import { Message } from '@/services/agentService';
import { cn } from '@/lib/utils';
import { FileCode2, User, Bot, Search, Edit, Eye } from 'lucide-react';
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
      return messageDate.toISOString().slice(11, 16); 
    }
  };

  const parseToolContent = (content: string) => {
    const toolCallMatch = content.match(/<tool_call>([\s\S]*?)<\/tool_call>/);
    if (toolCallMatch) {
      try {
        const toolData = JSON.parse(toolCallMatch[1]);
        const actionText = content.split('<tool_call>')[0].trim();
        return {
          type: 'tool-call',
          action: actionText,
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
    let statusIcon = <FileCode2 className="w-4 h-4" />;
    let status = 'Processing...';
    let statusClass = 'text-blue-400';
    
    if (toolContent.tool === 'list_files') {
      statusIcon = <Search className="w-4 h-4" />;
      status = 'Searching files...';
      statusClass = 'text-amber-400';
    } else if (toolContent.tool === 'read_file') {
      statusIcon = <Eye className="w-4 h-4" />;
      status = 'Reading file content...';
      statusClass = 'text-green-400';
    } else if (toolContent.tool === 'edit_file') {
      statusIcon = <Edit className="w-4 h-4" />;
      status = 'Editing file...';
      statusClass = 'text-purple-400';
    }
    
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <div className={cn(
            'flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md',
            'bg-zinc-800'
          )}>
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-zinc-400 text-sm mb-2">{toolContent.action}</p>
            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-800/50 border border-zinc-700/50", statusClass)}>
              {statusIcon}
              <div className="flex items-center gap-2">
                <span>{status}</span>
                <div className="flex space-x-1 ml-2">
                  <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 self-start mt-1">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  if (toolContent?.type === 'tool-result') {
    return null;
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
                  React.Children.toArray(children).some(
                    child => React.isValidElement(child) && child.type === 'pre'
                  )
                ) {
                  return <>{children}</>;
                }
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