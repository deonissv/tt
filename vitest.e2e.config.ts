/// <reference types="vitest" />
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, mergeConfig } from 'vitest/config';
import config from './vitest.base';

const _dirname = fileURLToPath(new URL('.', import.meta.url));

// Auto-count *.module.spec.ts files so minForks/maxForks stay in sync automatically.
const E2E_FILE_COUNT = (readdirSync('.', { recursive: true }) as string[]).filter(
  f => f.endsWith('.module.spec.ts') && !f.includes('node_modules'),
).length;

export default mergeConfig(defineConfig(config), {
  test: {
    fileParallelism: true,
    // forks give each file its own process.env, preventing DATABASE_URL races.
    pool: 'forks',
    // Pin worker count to file count so all files start simultaneously on any machine.
    // E2E tests are I/O-bound (DB/HTTP), so more forks than CPUs is fine.
    poolOptions: {
      forks: {
        minForks: E2E_FILE_COUNT,
        maxForks: E2E_FILE_COUNT,
      },
    },
    include: ['**/*.module.spec.ts'],
    globalSetup: [resolve(_dirname, 'packages/server/test/globalSetup.ts')],
    testTimeout: 60000,
    hookTimeout: 120000,
    teardownTimeout: 120000,
  },
});
