/// <reference types="vitest" />
import { mergeConfig } from 'vitest/config';
import config from './vitest.base';

export default mergeConfig(config, {
  test: {
    include: ['**/*.module.spec.ts'],
  },
});
