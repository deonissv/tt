import type { Model } from '../Model';
import type { ActorBaseState } from './ActorBaseState';
import type { ActorState } from './ActorState';
import type { ActorType } from './ActorType';
import type { UnknownActorState } from './ActorUnion';

export interface BagState extends ActorBaseState {
  type: ActorType.BAG;

  model?: Model;
  children?: ActorState[];
  containedObjects: UnknownActorState[];
}
