import { ConsoleLogger } from '@nestjs/common';
import type { StartedTestContainer } from 'testcontainers';
import type { PrismaService } from '../src/prisma/prisma.service';
import { getDatabaseUrl, prismaMigrate, startContainer } from './testUtils';

const logger = new ConsoleLogger('DB Mock');

let container: StartedTestContainer;
let dbUrl: string;

const DBMockFactory = (): (() => PrismaService) => {
  let prismaService: PrismaService;

  beforeAll(async () => {
    if (!container) {
      logger.log('Starting DB Mock...');
      container = (await startContainer())!;
      const host = container.getHost();
      const port = container.getMappedPort(5432);
      dbUrl = getDatabaseUrl(host, port);
      process.env.DATABASE_URL = dbUrl;
      logger.log('DB Mock started');
    }
  });

  beforeEach(() => {
    logger.log('Migrating prisma...');
    prismaMigrate(dbUrl);
    logger.log('Prisma migrated');
  });

  afterAll(async () => {
    if (container) {
      logger.log('Stopping DB container...');
      await container.stop();
      logger.log('DB container stopped');
    }
  });

  return () => prismaService;
};

export const useDatabaseMock = DBMockFactory();
