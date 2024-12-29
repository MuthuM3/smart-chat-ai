import React from 'react';
import { useTheme } from '../context/ThemeContext';

export function TypingIndicator() {
  const { theme } = useTheme();
  
  return (
    <div className={`
      flex flex-row gap-4 p-4 rounded-lg my-2 mr-auto
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
      max-w-[80%] transition-colors duration-200
    `}>
      <div className="flex items-center gap-1">
        <div className="text-gray-600">AI is typing</div>
        <span className="flex gap-1">
          <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}