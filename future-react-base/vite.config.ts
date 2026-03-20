import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: {
      'react-router-dom': new URL('./vendor/react-router-dom/index.tsx', import.meta.url).pathname,
    },
  },
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
