import { Message } from '../types/chat';
import { ModelType } from '../types/models';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('Gemini API key is missing. Please add your API key to the .env file.');
}

// Initialize the Generative AI instance
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function getChatCompletion(messages: Message[], modelType: ModelType): Promise<string> {
  try {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return '';

    // Add context based on model type
    let prompt = lastMessage.content;
    if (modelType === 'code') {
      prompt = `You are a coding assistant. Please help with the following code-related question:\n\n${prompt}`;
    }

    // Format history for the chat
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      parts: [{ text: msg.content }],
    }));

    // Create chat
    const chat = model.startChat({
      history: history,
    });

    // Send message and get response
    const result = await chat.sendMessage([{ text: prompt }]);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Error in getChatCompletion:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}
