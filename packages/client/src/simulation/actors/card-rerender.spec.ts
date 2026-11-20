import { CreateBox, NullEngine, Scene, Texture, type MultiMaterial, type StandardMaterial } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { ActorType, type CardState } from '@tt/states';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Card } from './Card';

describe('Card.rerenderCard', () => {
  it('recovers the real face dimensions on reveal when public metadata was unavailable', async () => {
    const placeholder = new Texture(null, scene);
    const face = new Texture(null, scene);
    vi.spyOn(face, 'getBaseSize').mockReturnValue({ width: 800, height: 600 });
    vi.spyOn(Loader, 'loadTexture').mockResolvedValue(face);
    const state: CardState = {
      guid: 'fallback',
      name: 'Card',
      type: ActorType.CARD,
      faceURL: 'back.png',
      backURL: 'back.png',
      cols: 1,
      rows: 1,
      sequence: 0,
    };
    const card = new Card(state, CreateBox('fallback', {}, scene), placeholder, placeholder);
    await card.rerenderCard({ faceURL: 'face.png', backURL: 'back.png', cols: 2, rows: 3, sequence: 4 });
    expect(card.model.scaling.x).toBeCloseTo(3.2);
  });

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

  it('replaces the hidden face without rebuilding materials or changing the card shape', async () => {
    const state: CardState = {
      guid: 'card',
      name: 'Card',
      type: ActorType.CARD,
      faceURL: 'redacted.png',
      backURL: 'back.png',
      cols: 1,
      rows: 1,
      sequence: 0,
      faceAspectRatio: 0.7,
    };
    vi.spyOn(Loader, 'loadMesh').mockResolvedValue(CreateBox('card', {}, scene));
    const texture = new Texture(null, scene);
    const backTexture = new Texture(null, scene);
    const placeholderTexture = new Texture(null, scene);
    const loadTexture = vi
      .spyOn(Loader, 'loadTexture')
      .mockImplementation(url =>
        Promise.resolve(url === 'back.png' ? backTexture : url === 'redacted.png' ? placeholderTexture : texture),
      );

    const card = await Card.fromState(state);
    expect(card).not.toBeNull();

    const disposePlaceholder = vi.spyOn(placeholderTexture, 'dispose');
    const disposeFace = vi.spyOn(texture, 'dispose');
    const material = card!.model.material as MultiMaterial;
    const count = card!.model.subMeshes.length;
    const width = card!.model.scaling.x;
    const grid = {
      faceURL: 'revealed-face.png',
      backURL: 'back.png',
      cols: 2,
      rows: 3,
      sequence: 4,
    };
    await card!.rerenderCard(grid);
    await card!.rerenderCard(grid);

    expect(loadTexture.mock.calls.filter(([url]) => url === 'revealed-face.png')).toHaveLength(1);
    expect(card!.model.material).toBe(material);
    expect(card!.model.subMeshes).toHaveLength(count);
    expect(card!.model.scaling.x).toBeCloseTo(width);
    expect(width).toBeCloseTo(1.12);
    expect(backTexture.uScale).toBe(1);
    expect(backTexture.vScale).toBe(1);
    expect((material.subMaterials[1] as StandardMaterial).diffuseTexture).toBe(texture);
    expect(texture.uScale).toBe(0.5);
    expect(texture.vScale).toBeCloseTo(1 / 3);
    expect(card!.toState()).toMatchObject(grid);
    expect(disposePlaceholder).toHaveBeenCalledOnce();
    expect(disposeFace).not.toHaveBeenCalled();
  });
});
