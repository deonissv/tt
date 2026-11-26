import { ConfigService } from '@nestjs/config';

let counter = 0;

export default () => {
  counter++;
  const env: Record<string, string> = {
    PORT: (11000 + counter).toString(),
    SALT_ROUNDS: '1',
    JWT_SECRET: 'secret',
    JWT_EXPIRES_IN: '24h',
    VITE_STATIC_HOST: 'localhost',
    VITE_API_HOST: 'localhost',
    NODE_ENV: 'test',
  };

  return new ConfigService(env);
};
