import { vi } from 'vitest';

let counter = 0;

export default () => {
  counter++;
  return {
    getOrThrow: vi.fn((key: string) => {
      const env: Record<string, string> = {
        PORT: (11000 + counter).toString(),
        SALT_ROUNDS: '7',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '24h',
        NODE_ENV: 'test',
      };
      if (!env[key]) {
        throw new Error(`${key} is not set`);
      }
      return env[key];
    }),
  };
};
