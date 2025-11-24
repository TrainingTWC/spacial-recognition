import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Use process.env for Netlify deployment, fallback to .env files for local
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
    build: {
      target: 'es2022', // Support top-level await for Netlify deployment
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
