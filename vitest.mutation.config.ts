import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import config from './vitest.base';

// Single mutation project: unit tests only, no E2E or visual-suite projects.
// Vitest 4 removed the workspace API (see vitest.all.config.ts for the
// projects-mode equivalent), so this config stands alone.
export default mergeConfig(defineConfig(config), {
  test: {
    name: 'mutation',
    include: [
      'libs/**/*.{test,spec}.ts',
      'packages/{client,server}/**/*.{test,spec}.ts',
      'packages/visual-tests/**/*.test.ts',
    ],
    exclude: [...configDefaults.exclude, '**/*.module.spec.ts'],
    isolate: true,
    minWorkers: 1,
    maxWorkers: 1,
  },
});
