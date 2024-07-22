import type { Transformation } from '../Transformation';
import type { ActorType } from './ActorType';

export interface ActorStateBase {
  type: ActorType;

  guid: string;
  name: string;
  transformation?: Transformation;
  mass?: number;
}
