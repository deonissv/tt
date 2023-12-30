let counter = 0;

export default () => {
  counter++;
  return {
    getOrThrow: jest.fn((key: string) => {
      const env: Record<string, string> = {
        PORT: (5000 + counter).toString(),
        WS_PORT: (6000 + counter).toString(),
        SALT_ROUNDS: '7',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '24h',
      };
      if (!env[key]) {
        throw new Error(`${key} is not set`);
      }
      return env[key];
    }),
  };
};
