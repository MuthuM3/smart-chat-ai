export function getRequiredEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      'Please create a .env file in the project root with:\n' +
      'VITE_GEMINI_API_KEY=your-api-key-here'
    );
  }
  return value;
}