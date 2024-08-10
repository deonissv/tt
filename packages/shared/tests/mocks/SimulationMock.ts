import { HavokPlugin, Logger, NullEngine, Scene } from '@babylonjs/core';
import { initHavok } from '@shared/initHavok';

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
    scene.enablePhysics(undefined, hp);
  });

  return () => ({
    engine,
    scene,
  });
};

export const useSimulationMock = SimulationMock();
