/// <reference types="vitest" />
import { mergeConfig } from 'vitest/config';
import config from './vitest.base';

export default mergeConfig(config, {
  testTimeout: 3_000_000,
  hookTimeout: 6_000_000,
  teardownTimeout: 6_000_000,
  test: {
    include: ['**/*.module.spec.ts'],
  },
});
