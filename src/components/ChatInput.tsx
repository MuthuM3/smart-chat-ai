import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { BsSend, BsStopCircle } from 'react-icons/bs';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  suggestions?: string[];
}

export function ChatInput({ 
  onSendMessage, 
  onStopGeneration, 
  disabled = false,
  isGenerating = false,
  suggestions = []
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 px-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={disabled || isGenerating}
              className={`
                px-3 py-1.5 rounded-full text-sm
                ${theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <div className={`
        relative flex items-end gap-2 p-2
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
        border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type your message..."
          disabled={disabled}
          className={`
            flex-1 p-2 rounded-lg resize-none
            ${theme === 'dark' 
              ? 'bg-gray-700 text-white placeholder-gray-400' 
              : 'bg-gray-100 text-black placeholder-gray-500'
            }
            focus:outline-none focus:ring-2
            ${theme === 'dark' 
              ? 'focus:ring-blue-500' 
              : 'focus:ring-blue-400'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            min-h-[44px] max-h-[200px]
          `}
          style={{ lineHeight: '1.5' }}
        />
        
        {isGenerating ? (
          <button
            onClick={onStopGeneration}
            disabled={disabled || !onStopGeneration}
            className={`
              p-2 rounded-lg
              ${theme === 'dark' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-red-500 hover:bg-red-600'
              }
              text-white
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center
              min-w-[44px] h-[44px]
            `}
            aria-label="Stop generation"
          >
            <BsStopCircle className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            className={`
              p-2 rounded-lg
              ${theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
              }
              text-white
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center
              min-w-[44px] h-[44px]
            `}
            aria-label="Send message"
          >
            <BsSend className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}