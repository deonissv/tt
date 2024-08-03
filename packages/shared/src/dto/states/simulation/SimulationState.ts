import type { ActorBaseState, ActorStateUpdate, TableState } from '../actor';

export interface SimulationStateBase {
  leftHandedSystem?: boolean; // default: false | If true, the Y axis will be inverted, and the Z axis will be inverted
  gravity?: number; // default: -9.81
  table?: TableState;
}

export interface SimulationState extends SimulationStateBase {
  actorStates: ActorBaseState[];
  cursorPositions: CursorPositions;
}

export interface SimulationStateSave extends SimulationStateBase {
  actorStates?: ActorBaseState[]; // Objects on the table
}

export interface SimulationStateUpdate extends Omit<Partial<SimulationState>, 'actorStates'> {
  actorStates?: ActorStateUpdate[];
}

export type CursorPositions = Record<string, number[]>;
