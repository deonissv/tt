import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import type { ICameraInput } from '@babylonjs/core/Cameras/cameraInputsManager';
import type { IKeyboardEvent } from '@babylonjs/core/Events/deviceInputEvents';
import type { KeyboardInfo } from '@babylonjs/core/Events/keyboardEvents';
import { KeyboardEventTypes } from '@babylonjs/core/Events/keyboardEvents';
import type { Observer } from '@babylonjs/core/Misc/observable';
import type { Scene } from '@babylonjs/core/scene';
import type { Nullable } from '@babylonjs/core/types';

export class CameraKeyboardMoveInput implements ICameraInput<ArcRotateCamera> {
  camera: Nullable<ArcRotateCamera>;

  private moveSensetivity;

  private keysUp = new Set(['KeyW']);
  private keysDown = new Set(['KeyS']);
  private keysLeft = new Set(['KeyA']);
  private keysRight = new Set(['KeyD']);

  private _scene: Scene;
  private _observer: Nullable<Observer<KeyboardInfo>>;
  private _keys = new Set<string>();

  constructor(moveSensetivity: number) {
    this.moveSensetivity = moveSensetivity;
  }

  getClassName(): string {
    return 'CameraMouseInput';
  }

  getSimpleName(): string {
    return 'keyboard';
  }

  attachControl(noPreventDefault?: boolean | undefined): void {
    this._scene = this.camera!.getScene();

    this._observer = this._scene.onKeyboardObservable.add(kbInfo => {
      const evt = kbInfo.event;

      if (evt.metaKey) return;

      if (this.__bindedKeyPressed(evt)) {
        if (evt.preventDefault && !noPreventDefault) evt.preventDefault();

        if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
          if (!this._keys.has(evt.code)) this._keys.add(evt.code);
        } else {
          if (this._keys.has(evt.code)) this._keys.delete(evt.code);
        }
      }
    });
  }

  __bindedKeyPressed(evt: IKeyboardEvent) {
    return (
      this.keysUp.has(evt.code) ||
      this.keysDown.has(evt.code) ||
      this.keysLeft.has(evt.code) ||
      this.keysRight.has(evt.code)
    );
  }

  detachControl(): void {
    throw new Error('Not implemented: detachControl');
  }

  public checkInputs(): void {
    if (this._observer) {
      if (this._keys.size === 0) return;

      this._keys.forEach(key => {
        const coef = this._scene.useRightHandedSystem ? 1 : -1;
        switch (key) {
          case 'KeyW':
            {
              const dz = this.moveSensetivity * Math.sin(this.camera!.alpha);
              const dx = this.moveSensetivity * Math.cos(this.camera!.alpha);
              this.camera!.target.z -= dz;
              this.camera!.target.x -= dx;
            }
            break;
          case 'KeyS':
            {
              const dz = this.moveSensetivity * Math.sin(this.camera!.alpha);
              const dx = this.moveSensetivity * Math.cos(this.camera!.alpha);
              this.camera!.target.z += dz;
              this.camera!.target.x += dx;
            }
            break;
          case 'KeyA':
            {
              const dz = this.moveSensetivity * Math.cos(this.camera!.alpha);
              const dx = this.moveSensetivity * Math.sin(this.camera!.alpha);
              this.camera!.target.z += coef * dz;
              this.camera!.target.x -= coef * dx;
            }
            break;
          case 'KeyD':
            {
              const dz = this.moveSensetivity * Math.cos(this.camera!.alpha);
              const dx = this.moveSensetivity * Math.sin(this.camera!.alpha);
              this.camera!.target.z -= coef * dz;
              this.camera!.target.x += coef * dx;
            }
            break;
        }
      });
    }
  }
}
