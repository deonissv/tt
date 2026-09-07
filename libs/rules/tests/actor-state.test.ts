import {
  ActorType,
  TileType,
  applyActorStateUpdate,
  type ActorState,
  type ActorStateUpdate,
  type DeckState,
  type TileStackState,
} from '@tt/states';

const actor = (): ActorState => ({
  type: ActorType.ACTOR,
  guid: 'actor',
  name: 'Actor',
  model: { meshURL: 'actor.obj' },
  transformation: {
    position: [1, 2, 3],
    rotation: [0, 0, 0],
  },
});

describe('actor state updates', () => {
  it('retains variant fields in the distributive update type', () => {
    const update: ActorStateUpdate = {
      type: ActorType.DECK,
      guid: 'deck',
      cards: [],
    };

    expect(update).toEqual({ type: ActorType.DECK, guid: 'deck', cards: [] });
  });

  it('merges nested transformations without mutating either input', () => {
    const state = actor();
    const update: ActorStateUpdate = {
      guid: 'different-guid',
      name: 'Renamed',
      transformation: { position: [4, 5, 6] },
    };

    const result = applyActorStateUpdate(state, update);

    expect(result).toEqual({
      ...state,
      guid: state.guid,
      name: 'Renamed',
      transformation: {
        position: [4, 5, 6],
        rotation: [0, 0, 0],
      },
    });
    expect(state).toEqual(actor());
    expect(update).toEqual({
      guid: 'different-guid',
      name: 'Renamed',
      transformation: { position: [4, 5, 6] },
    });
  });

  it('merges actor-variant fields used by containers', () => {
    const deck: DeckState = {
      type: ActorType.DECK,
      guid: 'deck',
      name: 'Deck',
      cards: [],
    };
    const stack: TileStackState = {
      type: ActorType.TILE_STACK,
      guid: 'stack',
      name: 'Stack',
      tileType: TileType.BOX,
      faceURL: 'face.png',
      size: 3,
    };

    expect(
      applyActorStateUpdate(deck, {
        guid: deck.guid,
        cards: [
          {
            type: ActorType.CARD,
            guid: 'card',
            name: 'Card',
            faceURL: 'face.png',
            backURL: 'back.png',
            rows: 1,
            cols: 1,
            sequence: 0,
          },
        ],
      }),
    ).toMatchObject({ guid: deck.guid, cards: [{ guid: 'card' }] });
    expect(applyActorStateUpdate(stack, { guid: stack.guid, size: 2 })).toMatchObject({ guid: stack.guid, size: 2 });
  });
});
