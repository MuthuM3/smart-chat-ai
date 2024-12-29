const responses = [
  "I understand your question. Let me help you with that.",
  "That's an interesting point. Here's what I think...",
  "Based on the information provided, I would suggest...",
  "Let me break this down for you...",
  "Here's a detailed explanation of how this works...",
];

export function getRandomResponse(): Promise<string> {
  return new Promise((resolve) => {
    const randomIndex = Math.floor(Math.random() * responses.length);
    const randomDelay = Math.floor(Math.random() * 1000) + 1000; // 1-2 seconds
    setTimeout(() => {
      resolve(responses[randomIndex]);
    }, randomDelay);
  });
}