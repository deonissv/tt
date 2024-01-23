import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

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
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
