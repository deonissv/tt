import { OptionalAllBut } from '@tt/utils';
import type { ActorBaseState } from '../ActorBaseState';
import type { ActorType } from '../ActorType';
import type { UnknownActorState } from '../ActorUnion';
import type { Model } from '../Model';

export interface ActorState extends ActorBaseState {
  type: ActorType.ACTOR;

  model: Model;
  children?: ActorState[];
  containedObjects?: ActorBaseState[];
}

export type ActorStateUpdate = OptionalAllBut<UnknownActorState, 'guid'>;
