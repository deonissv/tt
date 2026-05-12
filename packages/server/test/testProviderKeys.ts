export const POSTGRES_USER = 'test';
export const POSTGRES_PASSWORD = 'test';
export const POSTGRES_DB = 'testdb';

export const TEST_DB_BASE_URL = 'TEST_DB_BASE_URL';
export const TEST_SCHEMA_SQL = 'TEST_SCHEMA_SQL';

declare module 'vitest' {
  interface ProvidedContext {
    TEST_DB_BASE_URL: string;
    TEST_SCHEMA_SQL: string;
  }
}
