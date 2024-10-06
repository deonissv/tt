export type DieActorType =
  | ActorType.DIE4
  | ActorType.DIE6
  | ActorType.DIE6ROUND
  | ActorType.DIE8
  | ActorType.DIE10
  | ActorType.DIE12
  | ActorType.DIE20;

export const enum ActorType {
  ACTOR,
  BAG,
  CARD,
  DECK,
  TILE,
  DIE6ROUND,
  DIE4,
  DIE6,
  DIE8,
  DIE10,
  DIE12,
  DIE20,
  TILE_STACK,
  PAWN_TOKEN,
}
