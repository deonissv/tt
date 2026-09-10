import { CreateBox, Logger } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { ActorType, type CardState, type DeckState } from '@tt/states';
import { initHavok } from '../../../src/utils';
import { getPhSim } from '../../../test/testUtils';
import { ServerActorBuilder } from '../serverActorBuilder';
import { AssetsManager } from './assets-manager';
import { Card } from './card';
import { Deck } from './deck';

function card(guid: string): CardState {
  return {
    type: ActorType.CARD,
    guid,
    name: guid,
    faceURL: `${guid}-face.png`,
    backURL: `${guid}-back.png`,
    rows: 1,
    cols: 1,
    sequence: 0,
  };
}

function deckState(cards: CardState[] = [card('bottom'), card('top')]): DeckState {
  return {
    type: ActorType.DECK,
    guid: 'deck',
    name: 'Deck',
    transformation: { position: [0, 1, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    cards,
  };
}

describe('Deck', () => {
  beforeAll(async () => {
    Logger.LogLevels = 0;
    await initHavok();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the card mesh and scales it to the number of cards', async () => {
    getPhSim();
    const state = deckState();
    const model = CreateBox('deck-model', { size: 1 });
    const loadMesh = vi.spyOn(Loader, 'loadMesh').mockResolvedValue(model);

    const deck = await Deck.fromState(state);

    expect(loadMesh).toHaveBeenCalledWith(AssetsManager.CARD_MODEL_URL);
    expect(deck).toBeInstanceOf(Deck);
    expect(deck?.size).toBe(2);
    expect(deck?.model.scaling.y).toBe(2);
  });

  it('returns null when the card mesh cannot be loaded', async () => {
    getPhSim();
    vi.spyOn(Loader, 'loadMesh').mockResolvedValue(null);

    await expect(Deck.fromState(deckState())).resolves.toBeNull();
  });

  it('draws the top card and updates the deck height', async () => {
    getPhSim();
    const state = deckState();
    const model = CreateBox('deck-model', { size: 1 });
    model.scaling.y = state.cards.length;
    const deck = new Deck(state, model);
    let builtState: CardState | undefined;
    vi.spyOn(ServerActorBuilder, 'build').mockImplementation(actorState => {
      builtState = actorState as CardState;
      return Promise.resolve(new Card(builtState, CreateBox('drawn-card', { size: 1 })));
    });

    const drawn = await deck.pickItem('client', 0.75);

    expect(builtState).toMatchObject({ guid: 'top', type: ActorType.CARD });
    expect(deck.toState().cards.map(({ guid }) => guid)).toEqual(['bottom']);
    expect(deck.size).toBe(1);
    expect(deck.model.scaling.y).toBe(1);
    expect(drawn?.picked).toBe('client');
    expect(drawn?.pickHeight).toBe(0.75);
    expect(state.cards).toHaveLength(2);
  });

  it('shuffles cards without mutating the input state', () => {
    getPhSim();
    const state = deckState([card('first'), card('second'), card('third')]);
    const deck = new Deck(state, CreateBox('deck-model', { size: 1 }));
    vi.spyOn(Math, 'random').mockReturnValue(0);

    deck.shuffle();

    expect(deck.toState().cards.map(({ guid }) => guid)).toEqual(['second', 'third', 'first']);
    expect(state.cards.map(({ guid }) => guid)).toEqual(['first', 'second', 'third']);
  });
});
