import React from 'react';
import { Conversation } from '../types/chat';
import { useTheme } from '../context/ThemeContext';
import { BsTrash } from 'react-icons/bs';

interface ChatHistoryProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
}

export function ChatHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat
}: ChatHistoryProps) {
  const { theme } = useTheme();

  return (
    <div className={`
      w-64 h-full overflow-hidden flex flex-col
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}
      border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
    `}>
      <div className="p-4">
        <button
          onClick={onNewChat}
          className={`
            w-full px-4 py-2 rounded-lg
            ${theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
            }
            text-white font-medium
            transition-colors duration-200
          `}
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          {conversations.slice().reverse().map((conversation) => (
            <div
              key={conversation.id}
              className={`
                group relative flex items-center gap-3 cursor-pointer
                ${conversation.id === currentConversationId
                  ? theme === 'dark'
                    ? 'bg-gray-800'
                    : 'bg-gray-200'
                  : theme === 'dark'
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-200'
                }
                transition-colors duration-200
              `}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex-1 min-w-0">
                <div className={`
                  text-sm font-medium truncate
                  ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
                `}>
                  {conversation.title || 'New Chat'}
                </div>
                <div className={`
                  text-xs truncate
                  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  {conversation.messages.length} messages
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
                className={`
                  opacity-0 group-hover:opacity-100
                  p-1 rounded-lg
                  ${theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-300 text-gray-500 hover:text-gray-700'
                  }
                  transition-all duration-200
                `}
                aria-label="Delete conversation"
              >
                <BsTrash className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
