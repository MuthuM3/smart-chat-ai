import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { useTheme } from '../context/ThemeContext';

interface ChatMessageProps {
  message: Message;
  isNew?: boolean;
}

export function ChatMessage({ message, isNew = false }: ChatMessageProps) {
  const { theme } = useTheme();
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const isUser = message.role === 'user';
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // For user messages or non-new messages, show content immediately
    if (isUser || !isNew) {
      setDisplayedText(message.content);
      setIsAnimating(true);
      return;
    }

    // For new assistant messages, animate
    if (message.content) {
      setIsAnimating(true);
      let currentText = '';
      const words = message.content.split(' ');
      let currentIndex = 0;

      // Clear any existing animation
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }

      // Start new animation
      animationRef.current = setInterval(() => {
        if (currentIndex < words.length) {
          currentText += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
          setDisplayedText(currentText);
          currentIndex++;
        } else {
          if (animationRef.current) {
            clearInterval(animationRef.current);
          }
          setIsAnimating(false);
        }
      }, 50);

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [message.content, isUser, isNew]);

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(prev => prev === type ? null : type);
  };

  const getMessageHeader = () => {
    if (isUser) {
      return message.content;
    } else {
      if (message.content.toLowerCase().includes("two-line story")) {
        return "Here's a two-line story:";
      } else if (message.content.toLowerCase().includes("fun fact")) {
        return "Here's a fun fact:";
      }
      return "Assistant's response:";
    }
  };

  return (
    <div className="flex items-start gap-3">
      {isUser ? (
        <>
          <div className="flex-1" />
          <div className="text-sm text-gray-400 self-center">
            {message.content}
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-medium text-sm">
            M
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-medium text-sm">
            ✨
          </div>
          <div className="flex flex-col gap-1 max-w-[600px]">
            <div className="text-sm text-gray-400">
              {getMessageHeader()}
            </div>
            <div className="p-3 rounded-lg bg-[#1e2734] text-white">
              <div className="whitespace-pre-wrap">
                {displayedText}
                {isAnimating && (
                  <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                )}
              </div>
              {!isAnimating && message.content && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleFeedback('like')}
                    className="hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleFeedback('dislike')}
                    className="hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                  >
                    👎
                  </button>
                  <button
                    className="hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                  >
                    🔄
                  </button>
                  <button
                    className="hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                  >
                    ⋮
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}