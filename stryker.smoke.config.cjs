const config = require('./stryker.config.json');

module.exports = {
  ...config,
  vitest: { ...config.vitest, configFile: 'vitest.mutation.smoke.config.ts' },
  mutate: [
    'packages/server/src/rooms/client.ts',
    'packages/server/src/rooms/action-builder.ts',
    'packages/server/src/rooms/asset-url.service.ts',
    'packages/server/src/rooms/room-registry.ts',
    'packages/server/src/casl/casl-ability.factory.ts',
    'packages/server/src/auth/auth.service.ts',
    'packages/server/src/permissions.service.ts',
    'libs/utils/src/lib/guards.ts',
  ],
  thresholds: { ...config.thresholds, break: 80 },
  htmlReporter: { fileName: 'reports/mutation/smoke/index.html' },
  jsonReporter: { fileName: 'reports/mutation/smoke/mutation.json' },
  incrementalFile: 'reports/mutation/smoke/incremental.json',
};
