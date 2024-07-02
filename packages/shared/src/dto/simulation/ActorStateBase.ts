import type { Transformation } from './Transformation';

export interface ActorStateBase {
  guid: string;
  name: string;
  transformation?: Transformation;
  mass?: number;
}
