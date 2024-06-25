module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/packages/server/tsconfig.json',
        diagnostics: false,
        useESM: true,
      },
    ],
  },
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/packages/shared/$1',
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
  displayName: 'server',
  rootDir: '../../',
  roots: ['./packages/server/'],
  preset: 'ts-jest/presets/default-esm',
  openHandlesTimeout: 30000,
  testTimeout: 30000,
};
