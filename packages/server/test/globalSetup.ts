import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'path';
import type { ProvidedContext } from 'vitest';
import { getDatabaseUrl, startContainer, TEST_LOGGER } from './testUtils';

// When true, the container is left running between test runs for faster restarts.
const REUSE_CONTAINER = process.env.TESTCONTAINERS_REUSE_ENABLE === 'true';

type SetProvidedContextValue = <T extends keyof ProvidedContext>(key: T, value: ProvidedContext[T]) => void;

const execAsync = promisify(exec);

async function getSchemaSql(schemaPath: string): Promise<string> {
  const { stdout } = await execAsync(
    `npx prisma migrate diff --from-empty --to-schema-datamodel ${schemaPath} --script`,
  );
  return stdout;
}

export default async function ({ provide }: { provide: SetProvidedContextValue }) {
  TEST_LOGGER.log('[GlobalSetup] Starting shared DB container...');
  const schemaPath = resolve(__dirname, '../prisma/schema.prisma');

  // Run container startup and DDL generation in parallel — both are independent.
  const [startedContainer, schemaSql] = await Promise.all([startContainer(), getSchemaSql(schemaPath)]);

  const host = startedContainer.getHost();
  const port = startedContainer.getMappedPort(5432);

  const baseDbUrl = getDatabaseUrl(host, port);
  TEST_LOGGER.log('[GlobalSetup] Container started');

  provide('TEST_DB_BASE_URL', baseDbUrl);
  provide('TEST_SCHEMA_SQL', schemaSql);

  return async function () {
    if (startedContainer && !REUSE_CONTAINER) {
      TEST_LOGGER.log('[GlobalSetup] Stopping shared DB container...');
      await startedContainer.stop();
    }
  };
}
