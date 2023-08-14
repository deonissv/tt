import HavokPlugin from '@babylonjs/havok';
import { HavokPlugin as HP } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';

import { Scene } from '@babylonjs/core/scene';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';

import { CameraWheelInput } from './cameraInputs/cameraWheelInput';
import { CameraPointersInput } from './cameraInputs/cameraPointersInput';
import { CameraKeyboardMoveInput } from './cameraInputs/cameraKeyboardMoveInput';

import {
  CAMERA_DEFAULT_ALPHA,
  CAMERA_DEFAULT_BETA,
  CAMERA_DEFAULT_POSITION,
  CAMERA_DEFAULT_RADIUS,
  MOVE_SENSETIVITY,
  WHEEL_SENSETIVITY,
} from '../shared/constants';

export class PlaygroundScene extends Scene {
  private constructor(engine: Engine, canvas: HTMLCanvasElement) {
    super(engine);

    this.initCamera(canvas);
    this.initLight();
  }

  public static async init(engine: Engine, canvas: HTMLCanvasElement): Promise<PlaygroundScene> {
    const scene = new PlaygroundScene(engine, canvas);
    scene.useRightHandedSystem = true;

    scene.initCamera(canvas);
    scene.initLight();
    await scene.initPhysics();

    return scene;
  }

  private initCamera(canvas: HTMLCanvasElement) {
    const camera = new ArcRotateCamera(
      'Camera',
      CAMERA_DEFAULT_ALPHA,
      CAMERA_DEFAULT_BETA,
      CAMERA_DEFAULT_RADIUS,
      CAMERA_DEFAULT_POSITION,
      this
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
    light.intensity = 0.4;
  }

  private async initPhysics() {
    const hk = new HP(true, await HavokPlugin());
    const gravity = new Vector3(0, -9.81, 0);
    this.enablePhysics(gravity, hk);
  }
}
