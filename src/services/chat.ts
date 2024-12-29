import { Message } from '../types/chat';
import { ModelType } from '../types/models';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from './prompts';

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

export class ChatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatError';
  }
}

export async function getChatCompletion(
  content: string,
  modelType: ModelType,
  signal?: AbortSignal
): Promise<string> {
  try {
    const gemini = getGeminiClient();
    const model = gemini.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      },
    });

    // Add system prompt first
    const systemPrompt = getSystemPrompt(modelType);
    await chat.sendMessage(systemPrompt);

    // Send the user's message
    const result = await chat.sendMessage(content);
    const response = await result.response;
    const text = await response.text();
    
    if (!text) {
      throw new ChatError('No response from AI model');
    }

    return text;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error;
    }
    
    console.error('Error in getChatCompletion:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('SAFETY')) {
      throw new ChatError(
        "I apologize, but I cannot provide a response to that request. " +
        "It may have triggered safety filters. Please try rephrasing your question " +
        "or asking something else."
      );
    }
    
    if (error.message?.includes('BLOCKED')) {
      throw new ChatError(
        "I apologize, but that type of request is not allowed. " +
        "Please try asking something else."
      );
    }

    throw new ChatError(
      error instanceof Error 
        ? error.message 
        : 'Failed to get AI response. Please try again.'
    );
  }
}