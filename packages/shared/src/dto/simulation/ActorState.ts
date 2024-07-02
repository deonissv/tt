import type { OpnitalAllBut } from '@shared/utils';
import type { ActorModel } from './ActorModel';
import type { ActorStateBase } from './ActorStateBase';

export interface ActorState extends ActorStateBase {
  model: ActorModel;

  colorDiffuse?: number[]; // default: [1, 1, 1]
  children?: ActorState[];
}

export type ActorStateUpdate = OpnitalAllBut<ActorState, 'guid'>;
