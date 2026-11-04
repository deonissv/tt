/// <reference types="vitest" />
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import config from './vitest.base';

export default mergeConfig(defineConfig(config), {
  test: {
    name: 'unit',
    exclude: [...configDefaults.exclude, '**/*.module.spec.ts', 'packages/visual-tests/**'],
  },
});
