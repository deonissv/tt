import type { OnModuleInit } from '@nestjs/common';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

const logger = new ConsoleLogger('Prisma');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();

    const extendedCLient = this.$extends(
      createSoftDeleteExtension({
        models: {
          Game: true,
          User: true,
        },
        defaultConfig: {
          field: 'deletedAt',
          createValue: deleted => {
            if (deleted) return new Date();
            return null;
          },
        },
      }),
    );

    Object.assign(this, extendedCLient);
  }

  async onModuleInit() {
    logger.log(`Initializing prisma connection: ${process.env.DATABASE_URL}`);
    await this.$connect().catch((e: PrismaClientInitializationError) => {
      logger.error(`Failed to connect to database ${process.env.DATABASE_URL}`);
      logger.error(e);
      logger.error('Exiting process...');
      process.kill(process.pid, 'SIGTERM');
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
