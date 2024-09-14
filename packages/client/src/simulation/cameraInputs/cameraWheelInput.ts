import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import type { ICameraInput } from '@babylonjs/core/Cameras/cameraInputsManager';
import type { IWheelEvent } from '@babylonjs/core/Events/deviceInputEvents';
import { EventConstants } from '@babylonjs/core/Events/deviceInputEvents';
import type { PointerInfo } from '@babylonjs/core/Events/pointerEvents';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
import type { Observer } from '@babylonjs/core/Misc/observable';
import { Observable } from '@babylonjs/core/Misc/observable';
import type { Nullable } from '@babylonjs/core/types';

export class CameraWheelInput implements ICameraInput<ArcRotateCamera> {
  protected _wheelDeltaX = 0;
  protected _wheelDeltaY = 0;
  protected _wheelDeltaZ = 0;
  private readonly _ffMultiplier = 12;
  private readonly _normalize = 150;

  public camera: ArcRotateCamera;

  public onChangedObservable = new Observable<{ wheelDeltaX: number; wheelDeltaY: number; wheelDeltaZ: number }>();

  private _wheel: Nullable<(pointer: PointerInfo) => void>;
  private _observer: Nullable<Observer<PointerInfo>>;

  public getClassName(): string {
    return 'CameraWheelInput';
  }

  public getSimpleName(): string {
    return 'mousewheel';
  }

  public attachControl(noPreventDefault?: boolean): void {
    this._wheel = pointer => {
      if (pointer.type !== PointerEventTypes.POINTERWHEEL) {
        return;
      }

      const event = pointer.event as IWheelEvent;
      event.preventDefault();
      if (event.preventDefault && !noPreventDefault) event.preventDefault();

      const platformScale = event.deltaMode === EventConstants.DOM_DELTA_LINE ? this._ffMultiplier : 1;

      this._wheelDeltaX += (this.camera.wheelPrecision * platformScale * event.deltaX) / this._normalize;
      this._wheelDeltaY -= (this.camera.wheelPrecision * platformScale * event.deltaY) / this._normalize;
      this._wheelDeltaZ += (this.camera.wheelPrecision * platformScale * event.deltaZ) / this._normalize;
    };

    this._observer = this.camera
      .getScene()
      ._inputManager._addCameraPointerObserver(this._wheel, PointerEventTypes.POINTERWHEEL);
  }

  public detachControl(): void {
    if (this._observer) {
      this.camera.getScene()._inputManager._removeCameraPointerObserver(this._observer);
      this._observer = null;
      this._wheel = null;
    }
    if (this.onChangedObservable) {
      this.onChangedObservable.clear();
    }
  }

  public checkInputs(): void {
    this.onChangedObservable.notifyObservers({
      wheelDeltaX: this._wheelDeltaX,
      wheelDeltaY: this._wheelDeltaY,
      wheelDeltaZ: this._wheelDeltaZ,
    });

    this.camera.inertialRadiusOffset += this._wheelDeltaY;

    this._wheelDeltaX = 0;
    this._wheelDeltaY = 0;
    this._wheelDeltaZ = 0;
  }
}
