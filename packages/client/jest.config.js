module.exports = {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/packages/client/tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/packages/shared/$1',
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
  displayName: 'client',
  rootDir: '../../',
  roots: ['./packages/client/'],
  preset: 'ts-jest',
};
