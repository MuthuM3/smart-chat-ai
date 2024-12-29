import React from 'react';

interface DismissibleErrorProps {
  message: string;
  onDismiss: () => void;
}

export function DismissibleError({ message, onDismiss }: DismissibleErrorProps) {
  return (
    <div className="relative p-4 mx-4 my-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg flex items-center justify-between">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-4 text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-100 transition-colors"
        aria-label="Dismiss error"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
    </div>
  );
}
