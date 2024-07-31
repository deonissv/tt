/// <reference types="vitest" />
import path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'packages/shared/src/'),
      '@assets': path.resolve(__dirname, 'packages/shared/tests/assets/'),
      '@client': path.resolve(__dirname, 'packages/client/'),
      '@server': path.resolve(__dirname, 'packages/server/'),
    },
  },
  test: {
    isolate: false,
    globals: true,
    root: './',
  },
  testTimeout: 30000,
  hookTimeout: 60000,
  teardownTimeout: 60000,
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
