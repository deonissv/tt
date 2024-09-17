import type { ActorBaseState } from './ActorBaseState';
import type { ActorType } from './ActorType';

export interface PawnTokenState extends ActorBaseState {
  type: ActorType.PAWN_TOKEN;
}
