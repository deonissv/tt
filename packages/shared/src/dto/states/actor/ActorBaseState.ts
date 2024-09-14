import type { Transformation } from '../Transformation';
import type { ActorType } from './ActorType';

export interface ActorBaseState {
  type: ActorType;

  guid: string;
  name: string;
  transformation?: Transformation;
  mass?: number;
  colorDiffuse?: number[]; // default: [1, 1, 1]
  locked?: boolean;
}
