import type WebSocket from 'ws';
import type { ValidatedUser } from '../auth/validated-user';
import type { Simulation } from '../simulation/simulation';
import { ActionBuilder } from './action-builder';
import type { DownloadProgress } from '@tt/actions';
import { ServerAction, type CursorsPld, type ServerActionMsg } from '@tt/actions';
import { Channel } from '@tt/channel';
import { Logger } from '@nestjs/common';
import type { SimulationState } from '@tt/states';
import type { SimulationBuilder } from './simulation-builder';

/**
 * The `Client` class represents a client connected to the server.
 * It handles the communication between the client and the server,
 * manages the client's state, and processes actions.
 */
export class Client {
  private readonly logger = new Logger('Client');

  userId: number;
  username: string;
  code: string;
  roleId: number;

  pickHeight: number;
  rotationStep: number;

  simulation: Simulation;
  ws: WebSocket;

  actionBuilder: ActionBuilder;

  private constructor(user: ValidatedUser, ws: WebSocket, simulation: Simulation, downloadProgress: DownloadProgress) {
    this.userId = user.userId;
    this.username = user.username;
    this.code = user.code;
    this.roleId = user.roleId;

    this.ws = ws;

    this.pickHeight = 1.5;
    this.rotationStep = Math.PI / 18;

    this.simulation = simulation;
    this.actionBuilder = new ActionBuilder(simulation);
    this.sendState({
      ...simulation.toState(),
      downloadProgress: downloadProgress,
    });
  }

  static async init(user: ValidatedUser, ws: WebSocket, simulationBuilder: SimulationBuilder) {
    return await new Promise<Client>(resolve => {
      simulationBuilder.onDownloadProgress = downloadProgress => {
        Channel.send(ws, [
          {
            type: ServerAction.DOWNLOAD_PROGRESS,
            payload: downloadProgress,
          },
        ]);
      };
      simulationBuilder.onReady = (simulation, downloadProgress) => {
        const client = new Client(user, ws, simulation, downloadProgress);
        resolve(client);
      };
    });
  }

  private sendState(simulationState: SimulationState) {
    this.send([
      {
        type: ServerAction.STATE,
        payload: simulationState,
      },
    ]);
  }

  /**
   * Updates the client's state.
   * Sends the state update to the client based on the previous and the new state.
   */
  update(cursors: CursorsPld) {
    const cursorsAction = this.actionBuilder.getCursorsAction(cursors);
    const simActions = this.actionBuilder.getSimActions(this.simulation.toState());

    const actions = [] as ServerActionMsg[];
    if (cursorsAction && Object.keys(cursorsAction).length > 1) {
      const clientCursors = structuredClone(cursorsAction);
      delete clientCursors.payload[this.code];
      actions.push(cursorsAction);
    }
    if (simActions) actions.push(...simActions);

    if (actions && actions.length > 0) {
      this.logger.verbose(`Sending actions to [${this.code}]: ${JSON.stringify(actions)}`);
      this.send(actions);
    }
  }

  close() {
    this.send([
      {
        type: ServerAction.CLOSED,
        payload: null,
      },
    ]);
  }

  send(actions: ServerActionMsg[]) {
    Channel.send(this.ws, actions);
  }
}
