import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import useDatabaseMock from '../../test/useDatabaseMock';
import { EventsModule } from './events.module';
import { WsAdapter } from '@nestjs/platform-ws';
import type { WebSocket } from 'ws';
import { authMockAdminToken } from '../../test/authMock';

import { wsConnect } from '@shared/utils';

const PORT = 3333;

describe('AuthModule', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prismaService: PrismaService;
  let ws: WebSocket;
  let wsUrl: string;
  const mockDB = useDatabaseMock();

  beforeAll(async () => {
    prismaService = mockDB();

    module = await Test.createTestingModule({
      imports: [EventsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = module.createNestApplication({});
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.init();
    await app.listen(PORT);

    wsUrl = `ws://localhost:${PORT}/events`;
  });

  afterAll(async () => {
    await app.close();
    await module.close();
  });

  afterEach(() => {
    if (ws) {
      ws.close();
    }
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('ws auth', () => {
    // it('should be complete successfully', async () => {
    //    // start room
    //   ws = await wsConnect(wsUrl, `Bearer.${authMockAdminToken}`);
    //   expect(ws.readyState).toBe(WebSocket.OPEN);
    // });

    it('should not found the room', async () => {
      await expect(wsConnect(wsUrl, `Bearer.${authMockAdminToken}`)).rejects.toMatchObject({ type: 'error' });
    });

    it('should fail with no tocken', async () => {
      await expect(wsConnect(wsUrl)).rejects.toMatchObject({ type: 'error' });
    });

    it('should fail on damaged tocken', async () => {
      await expect(wsConnect(wsUrl, `Bearer.${authMockAdminToken}.asd`)).rejects.toMatchObject({ type: 'error' });
    });

    it('should fail on empty token', async () => {
      await expect(wsConnect(wsUrl, `Bearer`)).rejects.toMatchObject({ type: 'error' });
    });
  });
});
