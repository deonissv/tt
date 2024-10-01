import type { ConfigService } from '@nestjs/config';

let counter = 0;

export default () => {
  counter++;
  const env: Record<string, string> = {
    PORT: (11000 + counter).toString(),
    SALT_ROUNDS: '7',
    JWT_SECRET: 'secret',
    JWT_EXPIRES_IN: '24h',
    VITE_STATIC_HOST: 'localhost',
    NODE_ENV: 'test',
  };

  return {
    getOrThrow: vi.fn((key: string) => {
      if (!env[key]) {
        throw new Error(`${key} is not set`);
      }
      return env[key];
    }),
  } as unknown as ConfigService;
};
