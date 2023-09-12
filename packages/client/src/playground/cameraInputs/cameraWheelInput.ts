import { Nullable } from '@babylonjs/core/types';
import { Observable, Observer } from '@babylonjs/core/Misc/observable';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { ICameraInput } from '@babylonjs/core/Cameras/cameraInputsManager';
import { PointerEventTypes, PointerInfo } from '@babylonjs/core/Events/pointerEvents';
import { EventConstants, IWheelEvent } from '@babylonjs/core/Events/deviceInputEvents';

// @TODO refactor
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
