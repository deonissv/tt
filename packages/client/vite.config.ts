import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    exclude: ['HavokPhysics.wasm'],
  },
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
