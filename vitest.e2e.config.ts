/// <reference types="vitest" />
import { mergeConfig } from 'vitest/config';
import config from './vitest.base';

export default mergeConfig(config, {
  testTimeout: 3000000,
  hookTimeout: 6000000,
  teardownTimeout: 6000000,
  test: {
    include: ['**/*.module.spec.ts'],
  },
});
