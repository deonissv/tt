import { Model } from './actorModel';
import { Transformation } from './transformation';

type OpnitalAllBut<T, K extends keyof T> = Required<Pick<T, K>> & Omit<Partial<ActorState>, K>;

export interface ActorStateBase {
  guid: string;
}

export interface ActorState {
  name: string;
  guid: string;
  model: Model;

  colorDiffuse?: number[]; // default: [1, 1, 1]
  transformation?: Transformation;
  mass?: number; // default: 1
  children?: ActorState[];
}

export interface ActorStateUpdate extends OpnitalAllBut<ActorState, 'guid'> {}
