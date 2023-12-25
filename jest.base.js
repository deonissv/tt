module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/packages/shared/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
