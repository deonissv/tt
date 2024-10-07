import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Logger } from '@babylonjs/core/Misc/logger';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import { Scene } from '@babylonjs/core/scene';
import { initHavok } from '@shared/initHavok';

import '@babylonjs/core/Physics/physicsEngineComponent'; // enablePhysics

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
