import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
const ReactCompilerConfig = {
  target: '19',
};
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteReact({
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
  ],
  server: {
    host: true,
    port: 80,
  },
  preview: {
    host: true,
    port: 80,
  },
});
