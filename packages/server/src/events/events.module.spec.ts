import type { INestApplication } from '@nestjs/common';

import type { WebSocket } from 'ws';
import { authMockAdminToken } from '../../test/authMock';

import { useApp } from '@server/test/useApp';
import { wsConnect } from '@shared/utils';
import type { Server } from 'net';

const PORT = 3333;

describe('AuthModule', () => {
  let app: INestApplication<Server>;
  let ws: WebSocket;
  let wsUrl: string;

  beforeAll(async () => {
    app = (await useApp())[0];
    await app.listen(PORT);

    wsUrl = `ws://localhost:${PORT}/events`;
  });

  afterAll(async () => {
    await app.close();
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
