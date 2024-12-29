import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRequiredEnvVar } from './env';

let geminiInstance: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiInstance) {
    const apiKey = getRequiredEnvVar('VITE_GEMINI_API_KEY');
    geminiInstance = new GoogleGenerativeAI(apiKey);
  }
  return geminiInstance;
}