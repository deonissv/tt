import type { Model } from '../Model';
import type { ActorState } from './ActorState';
import type { ActorStateBase } from './ActorStateBase';
import type { ActorType } from './ActorType';

export interface BagState extends ActorStateBase {
  type: ActorType.BAG;

  model?: Model;
  children?: ActorState[];
  containedObjects: ActorStateBase[];
}
