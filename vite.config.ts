import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: true,
        allowedHosts: [
          'localhost',
          '127.0.0.1',
          '.manus.computer'
        ],
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_TAVILY_API_KEY': JSON.stringify(env.VITE_TAVILY_API_KEY),
        'process.env.VITE_GEMINI_MODEL_FAST': JSON.stringify(env.VITE_GEMINI_MODEL_FAST),
        'process.env.VITE_GEMINI_MODEL_DEEP': JSON.stringify(env.VITE_GEMINI_MODEL_DEEP)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
