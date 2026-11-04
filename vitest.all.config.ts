import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['./vitest.e2e.config.ts', './vitest.config.ts', './packages/visual-tests/vitest.config.ts'],
  },
});
