import { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { inject } from 'vitest';
import { permissions, roles } from '../prisma/permitions';
import { Client as PgClient } from 'pg';

let prisma: PrismaClient;
let schemaName: string;

const ALL_TABLES = Object.values(Prisma.ModelName)
  .map(t => `"${t}"`)
  .join(', ');

async function truncateAndSeed(): Promise<void> {
  await prisma.$transaction([
    prisma.$executeRawUnsafe(`TRUNCATE TABLE ${ALL_TABLES} RESTART IDENTITY CASCADE`),
    prisma.role.createMany({ data: roles }),
    prisma.permission.createMany({ data: permissions }),
  ]);
}

const DBMockFactory = (): (() => void) => {
  beforeAll(async () => {
    const baseUrl = inject('TEST_DB_BASE_URL');
    const schemaSql = inject('TEST_SCHEMA_SQL');
    schemaName = `test_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const dbUrl = `${baseUrl}?schema=${schemaName}`;

    const pgClient = new PgClient({ connectionString: baseUrl });
    await pgClient.connect();
    try {
      await pgClient.query(`CREATE SCHEMA "${schemaName}"`);
      await pgClient.query(`SET search_path TO "${schemaName}"`);
      await pgClient.query(schemaSql);
    } finally {
      await pgClient.end();
    }

    process.env.DATABASE_URL = dbUrl;
    prisma = new PrismaClient({ datasourceUrl: dbUrl });
  });

  beforeEach(async () => {
    await truncateAndSeed();
  });

  afterAll(async () => {
    if (!prisma) return;
    try {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    } finally {
      await prisma.$disconnect();
    }
  });

  return () => void 0;
};

export const useDatabaseMock = DBMockFactory();
