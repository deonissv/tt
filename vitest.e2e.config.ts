/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config';
import config from './vitest.base';

export default mergeConfig(defineConfig(config), {
  testTimeout: 3000000,
  hookTimeout: 6000000,
  teardownTimeout: 6000000,
  test: {
    fileParallelism: false,
    include: ['**/*.module.spec.ts'],
    testTimeout: 3000000,
    hookTimeout: 6000000,
    teardownTimeout: 6000000,
  },
});
