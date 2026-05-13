import type { ConfigService } from '@nestjs/config';
import type { Mocked } from 'vitest';

export const configServiceMock = {
  getOrThrow: vi.fn((key: string) => {
    const env: Record<string, string> = {
      PORT: '11000',
      SALT_ROUNDS: '1',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '24h',
      VITE_STATIC_HOST: 'localhost',
      VITE_API_HOST: 'localhost',
      NODE_ENV: 'test',
    };
    if (!env[key]) {
      throw new Error(`${key} is not set`);
    }
    return env[key];
  }),
} as unknown as Mocked<ConfigService>;
