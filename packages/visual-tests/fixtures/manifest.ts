import { ActorType } from '@tt/states';

export const ACTOR_MANIFEST = [
  { typeName: 'ACTOR', type: ActorType.ACTOR, guid: '3b9ed5' },
  { typeName: 'BAG', type: ActorType.BAG, guid: '7a0b0b' },
  { typeName: 'CARD', type: ActorType.CARD, guid: '8ac7c6' },
  { typeName: 'DECK', type: ActorType.DECK, guid: 'fb31d5' },
  { typeName: 'TILE', type: ActorType.TILE, guid: '7b4f3e' },
  { typeName: 'TILE_STACK', type: ActorType.TILE_STACK, guid: '51d35d' },
  { typeName: 'PAWN_TOKEN', type: ActorType.PAWN_TOKEN, guid: '29a87f' },
  { typeName: 'DIE4', type: ActorType.DIE4, guid: '60c5a3' },
  { typeName: 'DIE6', type: ActorType.DIE6, guid: 'cabfb6' },
  { typeName: 'DIE6ROUND', type: ActorType.DIE6ROUND, guid: '987a8f' },
  { typeName: 'DIE8', type: ActorType.DIE8, guid: 'bef483' },
  { typeName: 'DIE10', type: ActorType.DIE10, guid: '4290d0' },
  { typeName: 'DIE12', type: ActorType.DIE12, guid: 'f80f30' },
  { typeName: 'DIE20', type: ActorType.DIE20, guid: 'a0a9cc' },
];

export const manifestActor = (guid: string) => {
  const actor = ACTOR_MANIFEST.find(candidate => candidate.guid === guid);
  if (!actor) throw new Error(`Actor ${guid} is missing from the visual test manifest`);
  return actor;
};
