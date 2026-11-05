import { defineConfig } from 'vitest/config';
import config from './vitest.mutation.config';

export default defineConfig({
  ...config,
  test: {
    ...config.test,
    name: 'mutation-smoke',
    // Select specs here so Stryker activates static mutants before module initialization.
    // Replace include directly: mergeConfig concatenates arrays and would retain the full suite.
    include: [
      'packages/server/src/rooms/client.spec.ts',
      'packages/server/src/rooms/action-builder.spec.ts',
      'packages/server/src/rooms/asset-url.service.spec.ts',
      'packages/server/src/rooms/room-registry.spec.ts',
      'packages/server/src/casl/casl-ability.factory.spec.ts',
      'packages/server/src/auth/auth.service.spec.ts',
      'packages/server/src/permissions.service.spec.ts',
      'libs/utils/tests/utils.test.ts',
    ],
  },
});
