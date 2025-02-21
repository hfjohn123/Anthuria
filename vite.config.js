
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact()],
  server: {
    host: '0.0.0.0',
    port: 80,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 80,
    cors: true,
  },
});
