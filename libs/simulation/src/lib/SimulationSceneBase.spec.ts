import { CreateBox, NullEngine } from '@babylonjs/core';
import { SharedBase } from '@tt/actors';
import { ActorType } from '@tt/states';
import * as utils from '@tt/utils';
import { SimulationSceneBase } from './SimulationSceneBase';

describe('scene GUID allocation', () => {
  let engine: NullEngine;
  let scene: SimulationSceneBase;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new SimulationSceneBase(engine);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    scene.dispose();
    engine.dispose();
  });

  it('preserves an unused imported GUID and reserves it before an actor exists', () => {
    expect(scene.getUniqueGUID('imported')).toBe('imported');
    expect(scene.actors).toHaveLength(0);
    expect(scene.getUniqueGUID('imported')).not.toBe('imported');
  });

  it('checks pending reservations when generating a GUID', () => {
    vi.spyOn(utils, 'UUIDv4')
      .mockReturnValueOnce('aaaaaa-rest')
      .mockReturnValueOnce('aaaaaa-rest')
      .mockReturnValueOnce('bbbbbb-rest');

    expect(scene.getUniqueGUID()).toBe('aaaaaa');
    expect(scene.getUniqueGUID()).toBe('bbbbbb');
  });

  it('allows a released reservation to be reused', () => {
    scene.getUniqueGUID('imported');

    scene.releaseGUID('imported');

    expect(scene.getUniqueGUID('imported')).toBe('imported');
  });

  it('still protects a live actor after its creation reservation is released', () => {
    const guid = scene.getUniqueGUID('live');
    new SharedBase({ guid, name: 'Actor', type: ActorType.ACTOR }, CreateBox('model', {}, scene));

    scene.releaseGUID(guid);

    expect(scene.getUniqueGUID(guid)).not.toBe(guid);
  });

  it('keeps reservations separate for each scene', () => {
    const otherScene = new SimulationSceneBase(engine);
    try {
      expect(scene.getUniqueGUID('imported')).toBe('imported');
      expect(otherScene.getUniqueGUID('imported')).toBe('imported');
    } finally {
      otherScene.dispose();
    }
  });
});
