import { defineConfig } from 'vite';
import { claudeApiProxy } from './server/api-proxy';

export default defineConfig({
  base: '/starkidgame/',
  plugins: [claudeApiProxy()],
  server: {
    port: 5173,
  },
  build: {
    target: 'es2020',
  },
});
