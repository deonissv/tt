import { PlaygroundState } from '@tt/shared';
import axios from 'axios';

const LOADER_URL = 'http://localhost:3000/';
const WSS_URL = 'ws://localhost:8081/';

export const roomService = {
  async createRoom(playground?: PlaygroundState) {
    const response = await axios.post(LOADER_URL + 'room', {
      playground,
    });
    return response.data;
  },

  async connect(roomId: string): Promise<WebSocket> {
    const ws = new WebSocket(WSS_URL + roomId);

    ws.onmessage = event => {
      console.log(event.data);
    };

    return new Promise(() => {
      const timer = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          clearInterval(timer);
          return ws;
        }
      }, 10);
    });
  },
};
