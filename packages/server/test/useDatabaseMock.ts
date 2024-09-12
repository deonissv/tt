import type { StartedTestContainer } from 'testcontainers';

import { ConsoleLogger } from '@nestjs/common';
import type { PrismaService } from '../src/prisma/prisma.service';
import { getDatabaseUrl, prismaMigrate, startContainer } from './testUtils';

const logger = new ConsoleLogger('DB Mock');

const DBMockFactory = (): (() => PrismaService) => {
  let container: StartedTestContainer;
  let prismaService: PrismaService;
  let dbUrl: string;

  beforeAll(async () => {
    logger.log('Starting DB Mock...');
    container = (await startContainer())!;

    const host = container.getHost();
    const port = container.getMappedPort(5432);
    console.log('host', host);
    dbUrl = getDatabaseUrl(host, port);
    process.env.DATABASE_URL = dbUrl;

    logger.log('DB Mock stated');
  });

  beforeEach(() => {
    logger.log('Migrating prisma...');
    prismaMigrate(dbUrl);
    logger.log('Prisma migrated');
  });

  afterAll(async () => {
    logger.log('Stopping DB container...');
    await container.stop();
    logger.log('DB container stopped');
  });

  return () => prismaService;
};

export const useDatabaseMock = DBMockFactory();
