export default {
  getOrThrow: jest.fn((key: string) => {
    const env: Record<string, string> = {
      PORT: '5000',
      WS_PORT: '6000',
      SALT_ROUNDS: '5',
      JWT_SECRET: 'secret',
      JWT_EXPIRES_IN: '24h',
    };
    if (!env[key]) {
      throw new Error(`${key} is not set`);
    }
    return env[key];
  }),
};
