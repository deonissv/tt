import { ConfigService } from '@nestjs/config';

export const configServiceMock = new ConfigService({
  PORT: '11000',
  SALT_ROUNDS: '1',
  JWT_SECRET: 'secret',
  JWT_EXPIRES_IN: '24h',
  VITE_STATIC_HOST: 'localhost',
  VITE_API_HOST: 'localhost',
  NODE_ENV: 'test',
});

vi.spyOn(configServiceMock, 'getOrThrow');
