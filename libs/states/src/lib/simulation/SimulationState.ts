import type { DownloadProgressPld } from '@shared/ws/payloads';
import type { ActorStateUpdate, TableState } from '../actor';
import type { UnknownActorState } from '../ActorUnion';

export interface SimulationStateBase {
  leftHandedSystem?: boolean; // default: false | If true, the Y axis will be inverted, and the Z axis will be inverted
  gravity?: number; // default: -9.81
  table?: TableState;
}

export interface SimulationStateSave extends SimulationStateBase {
  actorStates?: UnknownActorState[]; // Objects on the table
}

export interface SimulationState extends SimulationStateSave {
  downloadProgress: DownloadProgressPld;
}

export interface SimulationStateUpdate extends Omit<Partial<SimulationStateSave>, 'actorStates'> {
  actorStates?: ActorStateUpdate[];
}

export type CursorPositions = Record<string, number[]>;
