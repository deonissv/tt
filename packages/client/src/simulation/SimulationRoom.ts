import { RoomService } from '@services/room.service';
import type { SimulationStateUpdate } from '@shared/dto/states';
import type { ActorBase } from '@shared/playground';
import { WS } from '@shared/ws';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { Simulation } from './Simulation';

const FRAME_RATE = 60;

const onPickItem = (ws: WebSocket, actor: ActorBase) => {
  WS.send(ws, {
    type: WS.ACTIONS.PICK_ITEM,
    payload: actor.guid,
  });
};

export class SimulationRoom {
  readonly ws: WebSocket;
  readonly simulation: Simulation;
  readonly clientId: string;
  readonly roomId: string;

  cursor: MutableRefObject<[number, number]>;
  updateTimeout: NodeJS.Timeout;
  lastUpdate: string;

  private constructor(
    ws: typeof SimulationRoom.prototype.ws,
    simulation: typeof SimulationRoom.prototype.simulation,
    clientId: typeof SimulationRoom.prototype.roomId,
    roomId: typeof SimulationRoom.prototype.roomId,
    cursor: typeof SimulationRoom.prototype.cursor,
  ) {
    this.ws = ws;
    this.simulation = simulation;
    this.clientId = clientId;
    this.roomId = roomId;
    this.cursor = cursor;

    this.updateTimeout = setInterval(() => {
      const simStateUpdate: SimulationStateUpdate = { cursorPositions: { [this.clientId]: cursor.current } };
      const updateStringified = JSON.stringify(simStateUpdate);
      if (this.lastUpdate === updateStringified) {
        return;
      }

      WS.send(this.ws, {
        type: WS.UPDATE,
        payload: simStateUpdate,
      });
      this.lastUpdate = updateStringified;
    }, 1000 / FRAME_RATE);
  }

  static async init(
    canvas: HTMLCanvasElement,
    roomId: typeof SimulationRoom.prototype.roomId,
    nickname = '',
    cursor: typeof SimulationRoom.prototype.cursor,
    setCursors: Dispatch<SetStateAction<Record<string, number[]>>>,
  ): Promise<SimulationRoom> {
    const [ws, clientId, simState] = await RoomService.connect(roomId, nickname);
    const sim = await Simulation.init(canvas, simState, {
      onPickItem: actor => onPickItem(ws, actor),
    });

    ws.addEventListener('message', event => {
      const message = WS.read(event);

      switch (message.type) {
        case WS.UPDATE: {
          const simStateUpdate = message.payload;
          sim.update(simStateUpdate);
          if (simStateUpdate.cursorPositions) {
            setCursors(prev => ({ ...prev, ...simStateUpdate.cursorPositions }));
          }
          break;
        }
        default:
          break;
      }
    });

    return new SimulationRoom(ws, sim, clientId, roomId, cursor);
  }

  destructor() {
    if (this.updateTimeout) clearInterval(this.updateTimeout);
    this.ws.close();
  }
}
