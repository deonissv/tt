import type { Tuple } from '@babylonjs/core/types';
import { AuthService, RoomService } from '@services';
import { ClientAction, ServerAction, WS } from '@shared/ws';
import type { CursorsPld } from '@shared/ws/payloads';
import type { ClientActionMsg } from '@shared/ws/ws';
import type { Dispatch, SetStateAction } from 'react';
import { Simulation } from './Simulation';
import type { ClientBase } from './actors';

const FRAME_RATE = 30;

export class SimulationRoom {
  static actions: ClientActionMsg[] = [];

  readonly ws: WebSocket;
  readonly simulation: Simulation;
  readonly clientId: string;
  readonly roomId: string;

  cursor: Tuple<number, 2>;
  updateTimeout: NodeJS.Timeout;
  lastUpdate: string;

  private constructor(
    ws: typeof SimulationRoom.prototype.ws,
    simulation: typeof SimulationRoom.prototype.simulation,
    clientId: typeof SimulationRoom.prototype.roomId,
    roomId: typeof SimulationRoom.prototype.roomId,
  ) {
    this.ws = ws;
    this.simulation = simulation;
    this.clientId = clientId;
    this.roomId = roomId;
    this.cursor = [0, 0];

    this.updateTimeout = setInterval(() => {
      this.sendUpdate();
    }, 1000 / FRAME_RATE);
  }

  sendUpdate() {
    const cursor = this.simulation.getCursor();
    const simStateUpdate = cursor;
    const updateStringified = JSON.stringify(simStateUpdate);
    if (this.lastUpdate === updateStringified && SimulationRoom.actions.length === 0) {
      return;
    }

    SimulationRoom.actions.push({
      type: ClientAction.CURSOR,
      payload: cursor,
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
    setCursors: Dispatch<SetStateAction<CursorsPld>>,
    setDownloadProgress: Dispatch<SetStateAction<Tuple<number, 2> | null>>,
    onRoomClosed: () => void,
  ): Promise<SimulationRoom> {
    const [ws, simState] = await RoomService.connect(roomId, setDownloadProgress);
    const sim = await Simulation.init(canvas, simState, SimulationRoom);
    const clientId = AuthService.getJWT()!.code;

    ws.addEventListener('message', event => {
      const message = WS.read(event);

      message.forEach(action => {
        switch (action.type) {
          case ServerAction.CURSORS: {
            setCursors(_ => ({ ...action.payload }));
            break;
          }
          case ServerAction.MOVE_ACTOR: {
            sim.handleMoveActor(action.payload.guid, action.payload.position);
            break;
          }
          case ServerAction.SPAWN_ACTOR: {
            void sim.handleSpawnActor(action.payload);
            break;
          }
          case ServerAction.SPAWN_PICKED_ACTOR: {
            if (action.payload.clientId === clientId) {
              void sim.handleSpawnPickedActor(action.payload.state);
            } else {
              void sim.handleSpawnActor(action.payload.state);
            }

            break;
          }
          case ServerAction.ROTATE_ACTOR: {
            sim.handleRotateActor(action.payload.guid, action.payload.position);
            break;
          }
          case ServerAction.RERENDER_DECK: {
            sim.handleDeckRerender(action.payload.guid, action.payload.grid, action.payload.size);
            break;
          }
          case ServerAction.CLOSED: {
            ws.close();
            onRoomClosed();
            break;
          }
        }
      });
    });

    return new SimulationRoom(ws, sim, clientId, roomId);
  }

  static onRoll = (actor: ClientBase) => {
    this.actions.push({
      type: ClientAction.ROLL,
      payload: actor.guid,
    });
  };

  static onPickItem = (actor: ClientBase) => {
    this.actions.push({
      type: ClientAction.PICK_ITEM,
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

  static onShuffle = (actor: ClientBase) => {
    this.actions.push({
      type: ClientAction.SHUFFLE,
      payload: actor.guid,
    });
  };

  closeRoom() {
    WS.send(this.ws, [{ type: ClientAction.CLOSE, payload: null }]);
  }

  destructor() {
    if (this.updateTimeout) clearInterval(this.updateTimeout);
    this.ws.close();
  }
}
