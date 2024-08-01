import { Test } from '@nestjs/testing';

import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from '@server/src/app.module';
import { PrismaService } from '@server/src/prisma.service';
import type { Server } from 'net';
import useConfigServiceMock from './useConfigServiceMock';

export const useApp = async () => {
  const configService = useConfigServiceMock();
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigService)
    .useValue(configService)
    .compile();

  const app = module.createNestApplication<INestApplication<Server>>();
  app.useWebSocketAdapter(new WsAdapter(app));

  const prismaService = module.get(PrismaService);
  await app.init();

  return [app, prismaService] as const;
};
