import type { ActorBaseState } from '../ActorBaseState';
import type { ActorType } from '../ActorType';
import type { UnknownActorState } from '../ActorUnion';
import type { Model } from '../Model';
import type { ActorState } from './ActorState';

export interface BagState extends ActorBaseState {
  type: ActorType.BAG;

  model?: Model;
  children?: ActorState[];
  containedObjects: UnknownActorState[];
}
