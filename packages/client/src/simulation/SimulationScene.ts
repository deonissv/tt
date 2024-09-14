import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import { CameraKeyboardMoveInput } from './cameraInputs/cameraKeyboardMoveInput';
import { CameraPointersInput } from './cameraInputs/cameraPointersInput';
import { CameraWheelInput } from './cameraInputs/cameraWheelInput';

import { HemisphericLight } from '@babylonjs/core';
import {
  CAMERA_DEFAULT_ALPHA,
  CAMERA_DEFAULT_BETA,
  CAMERA_DEFAULT_POSITION,
  CAMERA_DEFAULT_RADIUS,
  MOVE_SENSETIVITY,
  WHEEL_SENSETIVITY,
} from '@shared/constants';
import { SimulationSceneBase } from '@shared/playground/Simulation/SimulationSceneBase';

export class SimulationScene extends SimulationSceneBase {
  constructor(engine: AbstractEngine, leftHandedSystem = false) {
    super(engine);
    const canvas = engine.getRenderingCanvas();
    this.useRightHandedSystem = !leftHandedSystem;

    if (canvas) {
      this.initCamera(canvas);
      this.initLight();
      window.addEventListener('resize', () => {
        engine.resize();
      });
    }
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
    camera.lowerRadiusLimit = 10;
    camera.upperBetaLimit = 1.3;

    camera.inputs.clear();
    camera.inputs.add(new CameraKeyboardMoveInput(MOVE_SENSETIVITY));
    camera.inputs.add(new CameraWheelInput());
    camera.inputs.add(new CameraPointersInput());

    camera.attachControl(canvas);
    camera.wheelPrecision = WHEEL_SENSETIVITY;
  }

  private initLight() {
    const lights = [
      new HemisphericLight('light', new Vector3(0, 50, 0), this),
      new HemisphericLight('light', new Vector3(40, 50, 0), this),
      new HemisphericLight('light', new Vector3(0, 50, 40), this),
      new HemisphericLight('light', new Vector3(40, 50, 40), this),
      new HemisphericLight('light', new Vector3(40, 50, 0), this),
    ];
    lights.map(l => (l.intensity = 0.5));
  }
}
