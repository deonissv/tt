import type { OnModuleInit } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger(PrismaService.name);
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
    await this.$connect().catch((e: PrismaClientInitializationError) => {
      this.logger.error(e);
      process.kill(process.pid, 'SIGTERM');
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
