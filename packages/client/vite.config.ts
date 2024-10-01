import react from '@vitejs/plugin-react';
import * as path from 'node:path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode, isPreview }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react(), tsconfigPaths()],
    envDir: path.resolve(__dirname, '..', '..'),
    publicDir: !isProduction || isPreview ? path.resolve(__dirname, '..', '..', 'assets') : false,
    build: {
      outDir: path.resolve(__dirname, '..', '..', 'public'),
      assetsDir: '.',
      emptyOutDir: true,
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
  };
});
