import { ModelType } from '../types/models';

const prompts: Record<ModelType, string> = {
  chat: 'You are a helpful assistant who provides clear and concise answers.',
  creative: 'You are a creative assistant who helps with writing, brainstorming, and generating imaginative content.',
  structured: 'You are an assistant who provides structured, detailed responses with clear organization and formatting.',
};

export function getSystemPrompt(modelType: ModelType): string {
  return prompts[modelType];
}