import type { Tuple } from '@babylonjs/core/types';
import { RoomService } from '@services/room.service';
import { WS } from '@shared/ws';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type WebSocket from 'ws';
import type { MessageEvent } from 'ws';
import { Simulation } from './Simulation';
import type { ClientBase } from './actors';

const FRAME_RATE = 30;

export class SimulationRoom {
  static actions: WS.SimAction[] = [];

  readonly ws: WebSocket;
  readonly simulation: Simulation;
  readonly clientId: string;
  readonly roomId: string;

  cursor: MutableRefObject<Tuple<number, 2>>;
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
      this.sendUpdate();
    }, 1000 / FRAME_RATE);
  }

  sendUpdate() {
    const simStateUpdate = this.cursor.current;
    const updateStringified = JSON.stringify(simStateUpdate);
    if (this.lastUpdate === updateStringified) {
      return;
    }

    SimulationRoom.actions.push({
      type: WS.SimActionType.CURSOR,
      payload: this.cursor.current,
    });

    if (SimulationRoom.actions.length > 0) {
      WS.send(this.ws, SimulationRoom.actions);
      this.lastUpdate = updateStringified;
      SimulationRoom.actions = [];
    }
  }

  static async init(
    canvas: HTMLCanvasElement,
    roomId: typeof SimulationRoom.prototype.roomId,
    nickname = '',
    cursor: typeof SimulationRoom.prototype.cursor,
    setCursors: Dispatch<SetStateAction<WS.Cursors>>,
  ): Promise<SimulationRoom> {
    const [ws, clientId, simState] = await RoomService.connect(roomId, nickname);
    const sim = await Simulation.init(canvas, simState, {
      onPickItem: SimulationRoom.onPickItem,
      onMoveActor: SimulationRoom.onMoveActor,
    });

    ws.addEventListener('message', (event: MessageEvent) => {
      const message = WS.read(event);

      message.forEach(action => {
        switch (action.type) {
          case WS.SimActionType.CURSORS: {
            setCursors(prev => ({ ...prev, ...action.payload }));
            break;
          }
          case WS.SimActionType.MOVE_ACTOR: {
            sim.handleMoveActor(action.payload.guid, action.payload.position);
            break;
          }
          case WS.SimActionType.PICK_ITEM: {
            sim.handlePickItem(action.payload);
            break;
          }
        }
      });
    });

    return new SimulationRoom(ws, sim, clientId, roomId, cursor);
  }

  static onPickItem = (actor: ClientBase) => {
    this.actions.push({
      type: WS.SimActionType.PICK_ITEM,
      payload: actor.guid,
    });
  };

  static onMoveActor = (actor: ClientBase, position: Tuple<number, 3>) => {
    this.actions.push({
      type: WS.SimActionType.MOVE_ACTOR,
      payload: { guid: actor.guid, position },
    });
  };

  destructor() {
    if (this.updateTimeout) clearInterval(this.updateTimeout);
    this.ws.close();
  }
}
