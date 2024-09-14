/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config';
import config from './vitest.base';

export default mergeConfig(defineConfig(config), {
  test: {
    isolate: false,
    exclude: ['**/*.module.spec.ts'],
  },
});
