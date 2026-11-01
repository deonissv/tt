import type { Page, WebSocket } from '@playwright/test';

export function observeRoom(page: Page) {
  let current: WebSocket | undefined;
  let count = 0;

  const onSocket = (socket: WebSocket) => {
    if (!new URL(socket.url()).pathname.startsWith('/api/v1/ws/')) return;
    current = socket;
    count++;
  };

  page.on('websocket', onSocket);

  return {
    get socket(): WebSocket {
      if (page.isClosed() || !current || current.isClosed()) {
        throw new Error('The page has no open room WebSocket connection');
      }
      return current;
    },
    get connectionCount(): number {
      return count;
    },
    dispose(): void {
      page.off('websocket', onSocket);
      current = undefined;
    },
  };
}

export type RoomConnection = ReturnType<typeof observeRoom>;
