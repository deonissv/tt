import { StartedTestContainer } from 'testcontainers';

import { PrismaService } from '../src/prisma.service';
import { getDatabaseUrl, prismaMigrate, startContainer } from './testUtils';

export default (): (() => PrismaService) => {
  let container: StartedTestContainer;
  let prismaService: PrismaService;
  let dbUrl: string;

  beforeAll(async () => {
    container = await startContainer();

    const host = container.getHost();
    const port = container.getMappedPort(5432);
    dbUrl = getDatabaseUrl(host, port);
    process.env.DATABASE_URL = dbUrl;

    prismaService = new PrismaService();
  });

  beforeEach(() => {
    prismaMigrate(dbUrl);
  });

  afterAll(async () => {
    await container.stop();
  });

  return () => prismaService;
};
