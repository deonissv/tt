import { CreateBox, NullEngine, Scene, Texture } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { ActorType, type DeckState } from '@tt/states';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Deck } from './Deck';

const card = {
  guid: 'card',
  name: 'Card',
  type: ActorType.CARD as const,
  faceURL: 'face.png',
  backURL: 'back.png',
  cols: 1,
  rows: 1,
  sequence: 0,
};

describe('client deck snapshots', () => {
  let engine: NullEngine;
  let scene: Scene;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    scene.dispose();
    engine.dispose();
  });

  it('loads an empty deck without requesting nonexistent card textures', async () => {
    const state: DeckState = { guid: 'deck', name: 'Deck', type: ActorType.DECK, cards: [] };
    vi.spyOn(Loader, 'loadMesh').mockResolvedValue(CreateBox('deck', {}, scene));
    const loadTexture = vi.spyOn(Loader, 'loadTexture').mockResolvedValue(null);

    const deck = await Deck.fromState(state);

    expect(deck).toBeInstanceOf(Deck);
    expect(deck?.isEnabled()).toBe(false);
    expect(loadTexture).not.toHaveBeenCalled();
  });

  it('hides a depleted deck without loading another pair of textures', async () => {
    const state: DeckState = { guid: 'deck', name: 'Deck', type: ActorType.DECK, cards: [card] };
    const texture = new Texture(null, scene);
    const deck = new Deck(state, CreateBox('deck', {}, scene), texture, texture);
    const loadTexture = vi.spyOn(Loader, 'loadTexture').mockResolvedValue(null);

    await deck.rerenderDeck(card, 0, []);

    expect(deck.isEnabled()).toBe(false);
    expect(loadTexture).not.toHaveBeenCalled();
    expect(deck.toState().cards).toEqual([]);
  });

  it('adopts the delivered card order into its serialized state', async () => {
    const state: DeckState = { guid: 'deck', name: 'Deck', type: ActorType.DECK, cards: [card] };
    const texture = new Texture(null, scene);
    const deck = new Deck(state, CreateBox('deck', {}, scene), texture, texture);
    vi.spyOn(Loader, 'loadTexture').mockResolvedValue(texture);
    const nextTop = { ...card, guid: 'next-top', faceURL: 'next-face.png' };

    await deck.rerenderDeck(nextTop, 1, [nextTop]);

    expect(deck.toState().cards.map(loaded => loaded.guid)).toEqual(['next-top']);
    expect(deck.model.scaling.y).toBe(1);
  });

  it('updates its snapshot before textures finish loading', async () => {
    const cards = ['bottom', 'middle-a', 'middle-b', 'top'].map(guid => ({ ...card, guid }));
    const state: DeckState = { guid: 'deck', name: 'Deck', type: ActorType.DECK, cards };
    const texture = new Texture(null, scene);
    const deck = new Deck(state, CreateBox('deck', {}, scene), texture, texture);
    let finishLoading!: (texture: Texture | null) => void;
    vi.spyOn(Loader, 'loadTexture').mockReturnValue(new Promise(resolve => (finishLoading = resolve)));
    const shuffled = [cards[0], cards[2], cards[1], cards[3]];

    const rendering = deck.rerenderDeck(card, shuffled.length, shuffled);

    expect(deck.toState().cards).toEqual(shuffled);
    finishLoading(null);
    await rendering;
    expect(deck.toState().cards).toEqual(shuffled);
  });
});
