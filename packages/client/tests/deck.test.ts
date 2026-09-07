import { CreateBox, NullEngine, Scene, Texture } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { ActorType, type CardState, type DeckState } from '@tt/states';
import { Card } from '../src/simulation/actors/Card';
import { Deck } from '../src/simulation/actors/Deck';

const card = (guid: string): CardState => ({
  type: ActorType.CARD,
  guid,
  name: guid,
  faceURL: `${guid}.png`,
  backURL: 'back.png',
  rows: 1,
  cols: 1,
  sequence: 0,
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('Deck rendering', () => {
  let engine: NullEngine;
  let scene: Scene;
  let deck: Deck;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
    vi.spyOn(Card, 'getCardModel').mockImplementation(model => model);
    const state: DeckState = {
      type: ActorType.DECK,
      guid: 'deck',
      name: 'Deck',
      cards: [card('one'), card('two'), card('three')],
    };
    deck = new Deck(state, CreateBox('deck', {}, scene), new Texture(null, scene), new Texture(null, scene));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    scene.dispose();
    engine.dispose();
  });

  it('keeps the newest size when an older texture request finishes last', async () => {
    const pending = deferred<Texture>();
    const older = card('older');
    const newer = card('newer');
    vi.spyOn(Loader, 'loadTexture').mockImplementation(url =>
      url === older.faceURL ? pending.promise : Promise.resolve(new Texture(null, scene)),
    );

    const oldRender = deck.rerenderDeck(older, 2);
    await deck.rerenderDeck(newer, 1);
    expect(deck.model.scaling.y).toBe(1);

    pending.resolve(new Texture(null, scene));
    await oldRender;

    expect(deck.model.scaling.y).toBe(1);
  });
});
