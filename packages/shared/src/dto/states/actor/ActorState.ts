import type { OptionalAllBut } from '@shared/types';
import type { Model } from '../Model';
import type { ActorBaseState } from './ActorBaseState';
import type { ActorType } from './ActorType';
import type { UnknownActorState } from './ActorUnion';

export interface ActorState extends ActorBaseState {
  type: ActorType.ACTOR;

  model: Model;
  colorDiffuse?: number[]; // default: [1, 1, 1]
  children?: ActorState[];
  containedObjects?: ActorBaseState[];
}

export type ActorStateUpdate = OptionalAllBut<UnknownActorState, 'guid'>;
