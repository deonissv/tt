/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'packages/shared/src/'),
      '@assets': path.resolve(__dirname, 'packages/shared/tests/assets/'),
      '@client': path.resolve(__dirname, 'packages/client/'),
    },
  },
  test: {
    globals: true,
    root: './',
  },
});
