import type { Tuple } from '@babylonjs/core/types';
import { RoomService } from '@services/room.service';
import { ClientAction, ServerAction, WS } from '@shared/ws';
import type { CursorsPld } from '@shared/ws/payloads';
import type { ClientActionMsg } from '@shared/ws/ws';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { Simulation } from './Simulation';
import type { ClientBase } from './actors';

const FRAME_RATE = 30;

export class SimulationRoom {
  static actions: ClientActionMsg[] = [];

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
    if (this.lastUpdate === updateStringified && SimulationRoom.actions.length === 0) {
      return;
    }

    SimulationRoom.actions.push({
      type: ClientAction.CURSOR,
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
    setCursors: Dispatch<SetStateAction<CursorsPld>>,
  ): Promise<SimulationRoom> {
    const [ws, clientId, simState] = await RoomService.connect(roomId, nickname);
    const sim = await Simulation.init(canvas, simState, SimulationRoom);

    ws.addEventListener('message', event => {
      const message = WS.read(event);

      message.forEach(action => {
        switch (action.type) {
          case ServerAction.CURSORS: {
            setCursors(prev => ({ ...prev, ...action.payload }));
            break;
          }
          case ServerAction.MOVE_ACTOR: {
            sim.handleMoveActor(action.payload.guid, action.payload.position);
            break;
          }
          case ServerAction.SPAWN_ACTOR: {
            // eslint-disable-next-line no-console
            sim.handleSpawnActor(action.payload).catch(console.error);
            break;
          }
        }
      });
    });

    return new SimulationRoom(ws, sim, clientId, roomId, cursor);
  }

  static onPickItem = (actor: ClientBase) => {
    this.actions.push({
      type: ClientAction.PICK_START,
      payload: actor.guid,
    });
  };

  static onMoveActor = (actor: ClientBase, position: Tuple<number, 2>) => {
    this.actions.push({
      type: ClientAction.MOVE_ACTOR,
      payload: { guid: actor.guid, position },
    });
  };

  static onPickActor = (actor: ClientBase) => {
    this.actions.push({
      type: ClientAction.PICK_ACTOR,
      payload: actor.guid,
    });
  };

  static onReleaseActor = (actor: ClientBase) => {
    this.actions.push({
      type: ClientAction.RELEASE_ACTOR,
      payload: actor.guid,
    });
  };

  destructor() {
    if (this.updateTimeout) clearInterval(this.updateTimeout);
    this.ws.close();
  }
}
