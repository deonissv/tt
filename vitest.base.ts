/// <reference types="vitest" />
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    testTimeout: 30000,
    hookTimeout: 60000,
    teardownTimeout: 60000,
  },
  plugins: [
    swc.vite({
      exclude: ['**/node_modules/**', '**/stryker-setup-*.js'],
      module: { type: 'es6' },
    }),
    tsconfigPaths(),
  ],
});
