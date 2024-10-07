import type { SimulationState, UnknownActorState } from '@tt/states';
import { Tuple } from '@tt/utils';

import type { ClientAction, ServerAction, SimAction } from './actions';
import type {
  CursorsPld,
  DownloadProgressPld,
  DropActorPld,
  MoveClientActorPld,
  MoveServerActorPld,
  RerenderDeckPld,
  RotateClientActorPld,
  SpawnPickedActorPld,
} from './payloads';

interface ActionPayloads {
  // handshake
  [ClientAction.NICKNAME]: string;
  [ServerAction.CLIENT_ID]: string;
  [ServerAction.STATE]: SimulationState;
  [ServerAction.DOWNLOAD_PROGRESS]: DownloadProgressPld;

  [ClientAction.MOVE_ACTOR]: MoveServerActorPld;
  [ServerAction.MOVE_ACTOR]: MoveClientActorPld;
  [ServerAction.ROTATE_ACTOR]: RotateClientActorPld;

  [ClientAction.CLOSE]: null;
  [ClientAction.PICK_ITEM]: string;
  [ClientAction.CURSOR]: Tuple<number, 2>;
  [ClientAction.PICK_ACTOR]: string;
  [ClientAction.RELEASE_ACTOR]: string;
  [ClientAction.ROLL]: string;
  [ClientAction.SHUFFLE]: string;
  [ClientAction.FLIP]: string;
  [ClientAction.CW]: string;
  [ClientAction.CCW]: string;
  [ClientAction.SET_PICK_HEIGHT]: number;
  [ClientAction.SET_ROTATION_STEP]: number;

  [ServerAction.CLOSED]: null;
  [ServerAction.CURSORS]: CursorsPld;
  [ServerAction.SPAWN_ACTOR]: UnknownActorState;
  [ServerAction.SPAWN_PICKED_ACTOR]: SpawnPickedActorPld;
  [ServerAction.DROP_ACTOR]: DropActorPld;
  [ServerAction.REMOVE_ACTOR]: string;
  [ServerAction.RERENDER_DECK]: RerenderDeckPld;
}

export type MsgMap = {
  [K in SimAction]: { type: K; payload: ActionPayloads[K] };
};

export type ServerActionMsg = MsgMap[ServerAction];
export type ClientActionMsg = MsgMap[ClientAction];

export type ActionMsg = MsgMap[SimAction];
export type MSG = ActionMsg[];
