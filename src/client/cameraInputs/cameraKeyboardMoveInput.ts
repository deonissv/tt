import { Scene } from '@babylonjs/core/scene';
import { Nullable } from '@babylonjs/core/types';
import { Observer } from '@babylonjs/core/Misc/observable';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { IKeyboardEvent } from '@babylonjs/core/Events/deviceInputEvents';
import { KeyboardEventTypes, KeyboardInfo } from '@babylonjs/core/Events/keyboardEvents';
import { CameraInputTypes, ICameraInput } from '@babylonjs/core/Cameras/cameraInputsManager';

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
        if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
          if (!this._keys.has(evt.code)) this._keys.add(evt.code);
        } else {
          if (this._keys.has(evt.code)) this._keys.delete(evt.code);
        }
      }
      if (evt.preventDefault && !noPreventDefault) evt.preventDefault();
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
    throw new Error('Method not implemented.');
  }

  public checkInputs(): void {
    if (this._observer) {
      if (this._keys.size === 0) return;

      this._keys.forEach(key => {
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
              this.camera!.target.z += dz;
              this.camera!.target.x -= dx;
            }
            break;
          case 'KeyD':
            {
              const dz = this.moveSensetivity * Math.cos(this.camera!.alpha);
              const dx = this.moveSensetivity * Math.sin(this.camera!.alpha);
              this.camera!.target.z -= dz;
              this.camera!.target.x += dx;
            }
            break;
        }
      });
    }
  }
}

(<any>CameraInputTypes)['CameraKeyboardMoveInput'] = CameraKeyboardMoveInput;
