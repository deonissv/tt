import { CreateBox, NullEngine, Scene, Texture } from '@babylonjs/core';
import { ActorType, type CardState } from '@tt/states';
import { Card } from './Card';

const state: CardState = {
  guid: 'drawn-card',
  name: 'Drawn card',
  type: ActorType.CARD,
  faceURL: 'uncached-face.png',
  backURL: 'back.png',
  cols: 2,
  rows: 3,
  sequence: 1,
};

describe('card texture loading', () => {
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

  it('keeps a drawn card visible while its face loads and applies its eventual aspect ratio', () => {
    const face = new Texture(null, scene);
    const back = new Texture(null, scene);
    const card = new Card(state, CreateBox('card', {}, scene), face, back);

    expect(Number.isFinite(card.model.scaling.x)).toBe(true);
    expect(card.model.scaling.x).toBeGreaterThan(0);

    vi.spyOn(face, 'getBaseSize').mockReturnValue({ width: 800, height: 600 });
    face.onLoadObservable.notifyObservers(face);

    expect(card.model.scaling.x).toBeCloseTo(3.2);
  });

  it('ignores an old face that finishes loading after a deck rerender', () => {
    const oldFace = new Texture(null, scene);
    const newFace = new Texture(null, scene);
    vi.spyOn(newFace, 'getBaseSize').mockReturnValue({ width: 600, height: 600 });
    const model = CreateBox('deck', {}, scene);
    Card.getCardModel(model, oldFace, oldFace, state);
    Card.getCardModel(model, newFace, newFace, state);

    vi.spyOn(oldFace, 'getBaseSize').mockReturnValue({ width: 800, height: 600 });
    oldFace.onLoadObservable.notifyObservers(oldFace);

    expect(model.scaling.x).toBeCloseTo(2.4);
  });

  it('uses the aspect ratio immediately when the texture is already loaded', () => {
    const face = new Texture(null, scene);
    vi.spyOn(face, 'getBaseSize').mockReturnValue({ width: 800, height: 600 });

    const card = new Card(state, CreateBox('card', {}, scene), face, face);

    expect(card.model.scaling.x).toBeCloseTo(3.2);
  });
});
