/// <reference types="vitest" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: packageRoot,
  plugins: [tsconfigPaths({ projects: [path.resolve(packageRoot, '../../tsconfig.base.json')] })],
  test: {
    name: 'visual-unit',
    sequence: { groupOrder: 2 },
    include: ['**/*.test.ts', '**/*.test.mjs'],
    // Each worker loads Playwright; bound concurrent cold imports on busy hosts.
    maxWorkers: 4,
  },
});
