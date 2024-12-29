import React from 'react';
import { BsLightbulb } from 'react-icons/bs';
import { ModelType } from '../types/models';

const suggestions: Record<ModelType, string[]> = {
  chat: [
    'Explain how photosynthesis works',
    'What are the benefits of exercise?',
    'How does the internet work?'
  ],
  code: [
    'Help me write a React component',
    'How do I use TypeScript with React?',
    'Explain async/await in JavaScript',
    'Show me a REST API example'
  ],
  creative: [
    'Write a short story about a time traveler',
    'Generate ideas for a new video game',
    'Create a unique recipe for a fusion dish'
  ],
  structured: [
    'Compare and contrast renewable energy sources',
    'Analyze the causes of climate change',
    'List the steps to start a small business'
  ]
};

interface SuggestedPromptsProps {
  modelType: ModelType;
  onSelectPrompt: (prompt: string) => void;
}

export function SuggestedPrompts({ modelType, onSelectPrompt }: SuggestedPromptsProps) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3 text-gray-600">
        <BsLightbulb className="w-5 h-5" />
        <span className="text-sm font-medium">Suggested prompts</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions[modelType].map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}