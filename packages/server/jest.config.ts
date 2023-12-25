import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePaths: ['.'],
  rootDir: '../',
  projects: ['<rootDir>/server', '<rootDir>/shared'],
  testRegex: 'server/*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coveragePathIgnorePatterns: ['src/console', 'src/migration'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};

export default config;
