import HavokPhysics from '@babylonjs/havok';
// import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';

import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import { CameraKeyboardMoveInput } from './cameraInputs/cameraKeyboardMoveInput';
import { CameraPointersInput } from './cameraInputs/cameraPointersInput';
import { CameraWheelInput } from './cameraInputs/cameraWheelInput';

import {
  CAMERA_DEFAULT_ALPHA,
  CAMERA_DEFAULT_BETA,
  CAMERA_DEFAULT_POSITION,
  CAMERA_DEFAULT_RADIUS,
  GRAVITY,
  MOVE_SENSETIVITY,
  WHEEL_SENSETIVITY,
} from '@shared/constants';
import { SimulationSceneBase } from '@shared/playground/Simulation/SimulationSceneBase';

export class SimulationScene extends SimulationSceneBase {
  private constructor(engine: AbstractEngine) {
    super(engine);
  }

  public static async init(
    engine: AbstractEngine,
    gravity = GRAVITY,
    leftHandedSystem = false,
  ): Promise<SimulationScene> {
    const scene = new SimulationScene(engine);
    const canvas = engine.getRenderingCanvas();
    scene.useRightHandedSystem = !leftHandedSystem;

    if (canvas) {
      scene.initCamera(canvas);
      scene.initLight();
      window.addEventListener('resize', () => {
        engine.resize();
      });
    }

    await scene.initPhysics(gravity);

    return scene;
  }

  private initCamera(canvas: HTMLCanvasElement) {
    const camera = new ArcRotateCamera(
      'Camera',
      CAMERA_DEFAULT_ALPHA,
      CAMERA_DEFAULT_BETA,
      CAMERA_DEFAULT_RADIUS,
      new Vector3(CAMERA_DEFAULT_POSITION, CAMERA_DEFAULT_POSITION, CAMERA_DEFAULT_POSITION),
      this,
    );
    camera.setTarget(Vector3.Zero());

    camera.allowUpsideDown = false;
    camera.lowerRadiusLimit = 3;
    camera.upperBetaLimit = Math.PI / 2;

    camera.inputs.clear();
    camera.inputs.add(new CameraKeyboardMoveInput(MOVE_SENSETIVITY));
    camera.inputs.add(new CameraWheelInput());
    camera.inputs.add(new CameraPointersInput());

    camera.attachControl(canvas);
    camera.wheelPrecision = WHEEL_SENSETIVITY;
  }

  private initLight() {
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), this);
    light.intensity = 0.8;
  }

  private async initPhysics(_gravity: number) {
    await HavokPhysics();
    // const hk = new HavokPlugin(true, await HavokPhysics());
    // const gravityVec = new Vector3(0, -gravity, 0);
    // this.enablePhysics(gravityVec, hk);
  }
}
