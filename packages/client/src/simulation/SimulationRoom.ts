import { AuthService, RoomService } from '@services';
import { ActionMsg, ClientAction, ClientActionMsg, CursorsPld, DownloadProgressPld, ServerAction } from '@tt/actions';
import { Channel } from '@tt/channel';
import { Tuple } from '@tt/utils';
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
      Channel.send(this.ws, SimulationRoom.actions);
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
  ): Promise<[SimulationRoom, DownloadProgressPld]> {
    const [ws, simState] = await RoomService.connect(roomId, setDownloadProgress);
    const clientId = AuthService.getJWT()!.code;

    let sim: Simulation | null = null;
    const buffer: ActionMsg[] = [];

    const handleActtion = (action: ActionMsg) => {
      if (sim == null) {
        buffer.push(action);
        return;
      }

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
    };

    ws.addEventListener('message', event => {
      const message = Channel.read(event);

      message.forEach(action => {
        handleActtion(action);
      });
    });

    sim = await Simulation.init(canvas, simState, SimulationRoom);
    buffer.forEach(action => {
      handleActtion(action);
    });
    sim.start();

    return [new SimulationRoom(ws, sim, clientId, roomId), simState.downloadProgress];
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

  static onFlip = (actor: ClientBase) => {
    this.actions.push({
      type: ClientAction.FLIP,
      payload: actor.guid,
    });
  };

  static onCW = (actor: ClientBase) => {
    this.actions.push({
      type: ClientAction.CW,
      payload: actor.guid,
    });
  };

  static onCCW = (actor: ClientBase) => {
    this.actions.push({
      type: ClientAction.CCW,
      payload: actor.guid,
    });
  };

  closeRoom() {
    Channel.send(this.ws, [{ type: ClientAction.CLOSE, payload: null }]);
  }

  onSetPickHeight(height: number) {
    Channel.send(this.ws, [{ type: ClientAction.SET_PICK_HEIGHT, payload: height }]);
  }

  onSetRotateStep(step: number) {
    Channel.send(this.ws, [{ type: ClientAction.SET_ROTATION_STEP, payload: step }]);
  }

  destructor() {
    if (this.updateTimeout) clearInterval(this.updateTimeout);
    this.ws.close();
  }
}
