export default {
  getOrThrow: vi.fn((key: string) => {
    const env: Record<string, string> = {
      PORT: '11000',
      SALT_ROUNDS: '5',
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
