import React, { createContext, useContext, useState, useEffect } from 'react';
import { indexedDBService } from '../services/indexedDBService';
import { useUser } from './UserContext';

interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (role: string, content: string) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.email) {
        setMessages([]);
        return;
      }

      try {
        // Set user ID in IndexedDB
        indexedDBService.setUserId(user.email);

        // Try to load from IndexedDB first
        const localHistory = await indexedDBService.loadChatHistory();
        if (localHistory && localHistory.length > 0) {
          console.log('Loaded chat history from IndexedDB');
          setMessages(localHistory);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadMessages();
  }, [user?.email]);

  const addMessage = async (role: string, content: string) => {
    if (!user?.email) {
      console.warn('Cannot add message: No user logged in');
      return;
    }

    const newMessage: ChatMessage = {
      role,
      content,
      timestamp: Date.now()
    };

    // Update state immediately for better UI responsiveness
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    try {
      // Save to IndexedDB
      await indexedDBService.saveChatHistory(updatedMessages);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const clearMessages = async () => {
    if (!user?.email) {
      console.warn('Cannot clear messages: No user logged in');
      return;
    }

    setMessages([]);
    try {
      await indexedDBService.clearChatHistory();
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
