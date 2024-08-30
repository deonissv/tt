import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src/'),
      '@assets': path.resolve(__dirname, '../shared/tests/assets/'),
      '@client': path.resolve(__dirname, '../client/'),
    },
  },
  optimizeDeps: {
    exclude: ['./*/HavokPhysics.wasm', '@babylonjs/havok'],
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
