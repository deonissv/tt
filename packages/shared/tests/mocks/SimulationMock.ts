import { HavokPlugin, Logger, NullEngine, Scene, Vector3 } from '@babylonjs/core';
import { GRAVITY } from '@shared/constants';
import { initHavok } from '@shared/utils';

export const SimulationMock = (): (() => { scene: Scene; engine: NullEngine }) => {
  let engine: NullEngine;
  let scene: Scene;

  Logger.LogLevels = 0;

  beforeAll(async () => {
    await initHavok();
  });

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
    const hp = new HavokPlugin(true, global.havok);
    const gravityVec = new Vector3(0, GRAVITY, 0);
    scene.enablePhysics(gravityVec, hp);
  });

  return () => ({
    engine,
    scene,
  });
};

export const useSimulationMock = SimulationMock();
