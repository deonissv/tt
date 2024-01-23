import { execSync } from 'child_process';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

const POSTGRES_USER = 'test';
const POSTGRES_PASSWORD = 'test';
const POSTGRES_DB = 'testdb';
const POSTGRES_SERVER = 'localhost';

// TODO: re-write this when Prisma.io gets a programmatic migration API
// https://github.com/prisma/prisma/issues/4703
export function prismaMigrate(databaseUrl: string): void {
  execSync('npx prisma db push --force-reset; npx prisma db seed', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

export async function startContainer(): Promise<StartedTestContainer> {
  return await new GenericContainer('postgres:14-alpine')
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_USER: POSTGRES_USER,
      POSTGRES_PASSWORD: POSTGRES_PASSWORD,
      POSTGRES_DB: POSTGRES_DB,
      POSTGRES_SERVER: POSTGRES_SERVER,
    })
    .start();
}

export function getDatabaseUrl(host: string, port: number): string {
  return `postgresql://test:test@${host}:${port}/testdb`;
}
