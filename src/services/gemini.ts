import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

export function clearGeminiClient(): void {
  geminiClient = null;
}
