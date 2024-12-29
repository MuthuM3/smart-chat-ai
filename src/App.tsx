import React, { useState, useEffect, useRef, useMemo } from "react";
import { Message } from "./types/chat";
import { ModelType } from "./types/models";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { TypingIndicator } from "./components/TypingIndicator";
import { ModelSelector } from "./components/ModelSelector";
import { SuggestedPrompts } from "./components/SuggestedPrompts";
import { getChatCompletion } from "./services/chat";
import { Header } from "./components/Header";
import { ErrorMessage } from "./components/ErrorMessage";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { ChatProvider } from "./context/ChatContext";
import { ChatHistory } from "./components/ChatHistory";
import { indexedDBService } from "./services/indexedDBService";

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  userId: string;
  lastUpdated: number;
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelType, setModelType] = useState<ModelType>("chat");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Message suggestions based on model type
  const suggestions = useMemo(() => {
    if (modelType === "chat") {
      return ["Tell me a fun fact", "What's the weather like?", "How can you help me?", "Write a short story"];
    } else {
      return [
        "Write a function to sort an array",
        "How do I use async/await?",
        "Explain React hooks",
        "Debug this code",
      ];
    }
  }, [modelType]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        // Initialize IndexedDB
        await indexedDBService.initDB();

        const savedConversations = await indexedDBService.getConversations();
        setConversations(savedConversations);

        // Set the most recent conversation as current if exists
        if (savedConversations.length > 0) {
          setCurrentConversationId(savedConversations[0].id);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (lastMessageId || isTyping) {
      scrollToBottom();
    }
  }, [lastMessageId, isTyping]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    const newChat: Conversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      userId: "",
      lastUpdated: Date.now(),
    };

    setCurrentConversationId(newChat.id);
    setConversations((prev) => [newChat, ...prev]);
    setShowWelcome(true);
  };

  const handleSendMessage = async (content: string) => {
    setError(null);
    setShowWelcome(false);
    setIsTyping(true);
    setIsGenerating(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    // Update existing conversation or create new one
    let currentConversation = conversations.find((c) => c.id === currentConversationId);
    if (!currentConversation) {
      currentConversation = {
        id: crypto.randomUUID(),
        title: "New Chat",
        messages: [],
        userId: "",
        lastUpdated: Date.now(),
      };
      setCurrentConversationId(currentConversation.id);
    }

    const updatedConversation: Conversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      lastUpdated: Date.now(),
    };

    // Update state for immediate UI update
    setConversations((prev) => prev.map((c) => (c.id === currentConversationId ? updatedConversation : c)));

    try {
      const response = await getChatCompletion(content, modelType, abortControllerRef.current?.signal);

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      const finalConversation: Conversation = {
        ...updatedConversation,
        title: updatedConversation.title === "New Chat" ? content.slice(0, 30) + "..." : updatedConversation.title,
        messages: [...updatedConversation.messages, aiMessage],
        lastUpdated: Date.now(),
      };

      setConversations((prev) => prev.map((c) => (c.id === currentConversationId ? finalConversation : c)));
      setLastMessageId(aiMessage.id);
      await indexedDBService.saveConversation(finalConversation);
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("AI response generation was stopped");
      } else {
        console.error("Error in handleSendMessage:", error);
        setError(error instanceof Error ? error.message : "Failed to get AI response");
      }
    } finally {
      setIsTyping(false);
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setShowWelcome(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    await indexedDBService.deleteConversation(conversationId);
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));

    if (currentConversationId === conversationId) {
      startNewChat();
    }
  };

  // Sort conversations by lastUpdated in descending order
  const sortedConversations = [...conversations].sort((a, b) => b.lastUpdated - a.lastUpdated);

  const activeConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = activeConversation?.messages || [];

  return (
    <ThemeProvider>
      <UserProvider>
        <ChatProvider>
          <div className="flex flex-col h-screen bg-[#1a1e24]">
            <Header modelType={modelType} onModelChange={setModelType} />
            <div className="flex flex-1 overflow-hidden">
              <ChatHistory
                conversations={sortedConversations}
                currentConversationId={currentConversationId}
                onSelectConversation={switchConversation}
                onDeleteConversation={deleteConversation}
                onNewChat={startNewChat}
              />
              <div className="flex-1 flex flex-col">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto relative scroll-smooth">
                  <div className="max-w-3xl mx-auto">
                    {messages.length === 0 && showWelcome ? (
                      <WelcomeScreen>
                        <SuggestedPrompts modelType={modelType} onSelectPrompt={handleSendMessage} />
                      </WelcomeScreen>
                    ) : (
                      <div className="flex flex-col space-y-4 p-4">
                        {messages.map((message) => (
                          <ChatMessage key={message.id} message={message} isNew={message.id === lastMessageId} />
                        ))}
                        {isTyping && (
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-medium text-sm">
                              ✨
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="text-sm text-gray-400">AI is typing...</div>
                              <div className="p-3 rounded-lg bg-[#1e2734] text-gray-400">
                                <span className="inline-block">
                                  <span className="animate-pulse">...</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-700 p-4">
                  <div className="max-w-3xl mx-auto">
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      onStopGeneration={handleStopGeneration}
                      disabled={isTyping}
                      isGenerating={isGenerating}
                      suggestions={suggestions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ChatProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
