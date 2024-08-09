import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const fullReloadAlways: Plugin = {
  name: 'full-reload',
  handleHotUpdate({ server }) {
    server.ws.send({ type: 'full-reload' });
    return [];
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), fullReloadAlways],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src/'),
      '@assets': path.resolve(__dirname, '../shared/tests/assets/'),
      '@client': path.resolve(__dirname, '../client/'),
      '@server': path.resolve(__dirname, '../server/'),
    },
  },
  optimizeDeps: {
    exclude: ['./*/HavokPhysics.wasm', '@babylonjs/havok'],
  },
  server: {
    host: true,
    port: 5555,
  },
});
