import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import { Engine } from '@babylonjs/core/Engines/engine';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine';

export const EngineFactory = async (canvas?: HTMLCanvasElement): Promise<AbstractEngine> => {
  let engine: AbstractEngine;
  const engineOptions = {
    stencil: true,
  };
  if (!canvas) {
    return (engine = new NullEngine());
  }

  const webgpuSupported = await WebGPUEngine.IsSupportedAsync;
  if (webgpuSupported) {
    engine = new WebGPUEngine(canvas, engineOptions);
    await (engine as unknown as WebGPUEngine).initAsync();
  } else {
    engine = new Engine(canvas, true, engineOptions, true);
  }

  return engine;
};
