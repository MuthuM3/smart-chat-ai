import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="p-4 mx-4 my-2 bg-red-50 text-red-600 rounded-lg">
      {message}
    </div>
  );
}