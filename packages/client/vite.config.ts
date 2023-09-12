import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5500,
    open: true,
  },
  preview: {
    host: true,
    port: 5500,
    open: true,
  },
});
