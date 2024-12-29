export type ModelType = 'chat' | 'code';

export interface ModelConfig {
  type: ModelType;
  systemPrompt: string;
  temperature: number;
}