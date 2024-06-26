import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src/'),
      '@client': path.resolve(__dirname, '../client/'),
    },
  },
  optimizeDeps: {
    exclude: ['HavokPhysics.wasm'],
  },
  server: {
    host: true,
    port: 5500,
  },
  preview: {
    host: true,
    port: 5500,
    open: false,
  },
});
