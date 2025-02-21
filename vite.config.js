
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact()],
  server: {
    host: '0.0.0.0',
    port: 80,
    cors: true,
    allowedHosts: [
      '9f7b843e-7472-49a9-aa53-c74e316de5a7-00-f7x32eggu7n.worf.replit.dev'
    ],
  },
  preview: {
    host: '0.0.0.0',
    port: 80,
    cors: true,
    allowedHosts: [
      '9f7b843e-7472-49a9-aa53-c74e316de5a7-00-f7x32eggu7n.worf.replit.dev'
    ],
  },
});
