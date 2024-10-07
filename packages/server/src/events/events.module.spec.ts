import type { INestApplication } from '@nestjs/common';

import { WebSocket } from 'ws';
import { authMockAdminToken } from '../../test/authMock';

import type { Server } from 'net';
import { wsConnect } from '../../test/testUtils';
import { useApp } from '../../test/useApp';
import { useDatabaseMock } from '../../test/useDatabaseMock';

const PORT = 3333;

describe('WS', () => {
  useDatabaseMock();
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

  describe('ws auth', () => {
    it('should be complete successfully', { skip: true }, async () => {
      // start room
      ws = await wsConnect(wsUrl, `Bearer.${authMockAdminToken}`);
      // ws = no room found
      expect(ws.readyState).toBe(WebSocket.OPEN);
    });

    it('should not found the room', async () => {
      await expect(wsConnect(wsUrl, `Bearer.${authMockAdminToken}`)).rejects.toThrowError();
    });

    it('should fail with no tocken', async () => {
      await expect(wsConnect(wsUrl)).rejects.toThrowError();
    });

    it('should fail on damaged tocken', async () => {
      await expect(wsConnect(wsUrl, `Bearer.${authMockAdminToken}.asd`)).rejects.toThrowError();
    });

    it('should fail on empty token', async () => {
      await expect(wsConnect(wsUrl, `Bearer`)).rejects.toThrowError();
    });
  });
});
