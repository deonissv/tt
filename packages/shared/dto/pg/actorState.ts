import { Model } from './actorModel';
import { Transformation } from './transformation';

export interface ActorStateBase {
  guid: string;
}

export interface ActorState {
  name: string;
  guid: string;
  model: Model;

  transformation?: Transformation;
  mass?: number; // default: 1
}

export interface ActorStateUpdate {
  guid: string;
  name?: string;
  model?: Model;
  mass?: number;
  transformation?: Transformation;
}
