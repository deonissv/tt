import type { ActorModel } from './ActorModel';
import type { Transformation } from './Transformation';

type OpnitalAllBut<T, K extends keyof T> = Required<Pick<T, K>> & Omit<Partial<ActorState>, K>;

export interface ActorStateBase {
  guid: string;
}

export interface ActorState extends ActorStateBase {
  name: string;
  model: ActorModel;

  colorDiffuse?: number[]; // default: [1, 1, 1]
  transformation?: Transformation;
  mass?: number; // default: 1
  children?: ActorState[];
}

export type ActorStateUpdate = OpnitalAllBut<ActorState, 'guid'>;

export interface CardState extends ActorStateBase {
  name: string;
  faceURL: string;
  backURL: string;
  grid?: {
    rows: number;
    cols: number;
    row: number;
    col: number;
  };
  deckGrid?: {
    row: number;
    col: number;
  };
  transformation?: Transformation;
}

export interface DeckState extends ActorStateBase {
  name: string;
  transformation?: Transformation;
  faceURL: string;
  backURL: string;
  grid?: {
    rows: number;
    cols: number;
    number: number;
  };
}
