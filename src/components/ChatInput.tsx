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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
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
      
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center rounded-lg border ${
          isFocused ? 'border-blue-500' : 'dark:border-gray-700 border-gray-200'
        }`}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message..."
            className="w-full resize-none rounded-lg py-2 px-3 dark:bg-gray-800 bg-white dark:text-gray-200 text-gray-900 focus:outline-none min-h-[40px]"
            disabled={disabled}
          />
          <div className="absolute right-2 bottom-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="p-1 text-red-500 hover:text-red-600 transition-colors"
                disabled={disabled}
              >
                <BsStopCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                disabled={disabled || !message.trim()}
              >
                <BsSend className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}