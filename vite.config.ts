import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/smart-chat-ai/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
