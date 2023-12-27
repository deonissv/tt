import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();

    // @TODO replace with prisma extensions
    this.$use(
      createSoftDeleteMiddleware({
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
  }
}
