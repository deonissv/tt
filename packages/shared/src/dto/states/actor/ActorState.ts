import type { OpnitalAllBut } from '@shared/types';
import type { Model } from '../Model';
import type { ActorStateBase } from './ActorStateBase';
import type { ActorType } from './ActorType';

export interface ActorState extends ActorStateBase {
  type: ActorType.ACTOR;

  model: Model;
  colorDiffuse?: number[]; // default: [1, 1, 1]
  children?: ActorState[];
  containedObjects?: ActorStateBase[];
}

export type ActorStateUpdate = OpnitalAllBut<ActorState, 'guid'>;
