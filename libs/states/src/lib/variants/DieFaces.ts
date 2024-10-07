import type { DieType } from '../actor';
import type { DieActorType } from '../ActorType';
import { ActorType } from '../ActorType';

export const DieFacesNumber: Record<DieActorType, DieType> = {
  [ActorType.DIE4]: 4,
  [ActorType.DIE6ROUND]: 6,
  [ActorType.DIE6]: 6,
  [ActorType.DIE8]: 8,
  [ActorType.DIE10]: 10,
  [ActorType.DIE12]: 12,
  [ActorType.DIE20]: 20,
};
