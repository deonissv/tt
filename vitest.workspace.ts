import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './vitest.e2e.config.ts',
  './vitest.config.ts',
  './packages/client/vite.config.ts',
  './packages/playground/vite.config.ts',
]);
