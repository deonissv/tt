import { Model } from './actorModel';
import { Transformation } from './transformation';

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

export interface ActorStateUpdate {
  guid: string;
  name?: string;
  model?: Model;
  colorDiffuse?: number[];
  transformation?: Transformation;
  mass?: number;
  children?: ActorState[];
}
