import type { Action } from '@shared/ws/ws';
import type { ActorState, ActorStateUpdate, TableState } from '../actor';

export interface SimulationStateBase {
  leftHandedSystem?: boolean; // default: false | If true, the Y axis will be inverted, and the Z axis will be inverted
  gravity?: number; // default: -9.81
  table?: TableState;
}

export interface SimulationState extends SimulationStateBase {
  actorStates: ActorState[];
  cursorPositions: CursorPositions;
}

export interface SimulationStateSave extends SimulationStateBase {
  actorStates?: ActorState[]; // Objects on the table
}

export interface SimulationStateUpdate extends Omit<Partial<SimulationState>, 'actorStates'> {
  actorStates?: ActorStateUpdate[];
  actions?: Action[];
}

export type CursorPositions = Record<string, number[]>;
