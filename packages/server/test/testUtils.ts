import { Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import type { StartedTestContainer } from 'testcontainers';
import { GenericContainer } from 'testcontainers';

const logger = new Logger('TestUtils');

const POSTGRES_USER = 'test';
const POSTGRES_PASSWORD = 'test';
const POSTGRES_DB = 'testdb';
const POSTGRES_SERVER = 'localhost';

// TODO: re-write this when Prisma.io gets a programmatic migration API
// https://github.com/prisma/prisma/issues/4703
export function prismaMigrate(databaseUrl: string): void {
  execSync('npx prisma db push --force-reset && npx prisma db seed', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

export async function startContainer(): Promise<StartedTestContainer> {
  const container_name = 'postgres:14-alpine';
  logger.log(`Starting ${container_name} container...`);
  const container = await new GenericContainer(container_name)
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_USER: POSTGRES_USER,
      POSTGRES_PASSWORD: POSTGRES_PASSWORD,
      POSTGRES_DB: POSTGRES_DB,
      POSTGRES_SERVER: POSTGRES_SERVER,
    })
    .start();
  logger.log('Container started successfully');
  return container;
}

export function getDatabaseUrl(host: string, port: number): string {
  return `postgresql://test:test@${host}:${port}/testdb`;
}
