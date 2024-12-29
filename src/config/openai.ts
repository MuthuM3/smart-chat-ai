import OpenAI from 'openai';
import { getRequiredEnvVar } from './env';

let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = getRequiredEnvVar('VITE_OPENAI_API_KEY');
    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }
  return openaiInstance;
}