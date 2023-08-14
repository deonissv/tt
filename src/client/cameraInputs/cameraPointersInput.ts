import { Nullable } from '@babylonjs/core/types';
import { PointerTouch } from '@babylonjs/core/Events/pointerEvents';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { BaseCameraPointersInput } from '@babylonjs/core/Cameras/Inputs/BaseCameraPointersInput';

const RIGHT_MOUSE_BTN = 2;

// @TODO refactor
export class CameraPointersInput extends BaseCameraPointersInput {
  public camera: ArcRotateCamera;

  public static MinimumRadiusForPinch: number = 0.001;

  public angularSensibilityX = 1000.0;
  public angularSensibilityY = 1000.0;
  public pinchPrecision = 12.0;
  public pinchDeltaPercentage = 0;
  public useNaturalPinchZoom: boolean = false;
  public pinchZoom: boolean = true;
  public panningSensibility: number = 1000.0;
  public multiTouchPanning: boolean = true;
  public multiTouchPanAndZoom: boolean = true;
  public pinchInwards = true;

  private _twoFingerActivityCount: number = 0;
  private _isPinching: boolean = false;

  public getClassName(): string {
    return 'CameraPointersInput';
  }

  private _computeMultiTouchPanning(
    previousMultiTouchPanPosition: Nullable<PointerTouch>,
    multiTouchPanPosition: Nullable<PointerTouch>
  ): void {
    if (this.panningSensibility !== 0 && previousMultiTouchPanPosition && multiTouchPanPosition) {
      const moveDeltaX = multiTouchPanPosition.x - previousMultiTouchPanPosition.x;
      const moveDeltaY = multiTouchPanPosition.y - previousMultiTouchPanPosition.y;
      this.camera.inertialPanningX += -moveDeltaX / this.panningSensibility;
      this.camera.inertialPanningY += moveDeltaY / this.panningSensibility;
    }
  }

  private _computePinchZoom(previousPinchSquaredDistance: number, pinchSquaredDistance: number): void {
    const radius = this.camera.radius || CameraPointersInput.MinimumRadiusForPinch;
    if (this.useNaturalPinchZoom) {
      this.camera.radius = (radius * Math.sqrt(previousPinchSquaredDistance)) / Math.sqrt(pinchSquaredDistance);
    } else if (this.pinchDeltaPercentage) {
      this.camera.inertialRadiusOffset +=
        (pinchSquaredDistance - previousPinchSquaredDistance) * 0.001 * radius * this.pinchDeltaPercentage;
    } else {
      this.camera.inertialRadiusOffset +=
        (pinchSquaredDistance - previousPinchSquaredDistance) /
        ((this.pinchPrecision * (this.pinchInwards ? 1 : -1) * (this.angularSensibilityX + this.angularSensibilityY)) /
          2);
    }
  }

  public onTouch(point: Nullable<PointerTouch>, offsetX: number, offsetY: number): void {
    if (this._buttonsPressed === RIGHT_MOUSE_BTN) {
      this.camera.inertialAlphaOffset -= offsetX / this.angularSensibilityX;
      this.camera.inertialBetaOffset -= offsetY / this.angularSensibilityY;
    }
  }

  public onDoubleTap() {
    if (this.camera.useInputToRestoreState) {
      this.camera.restoreState();
    }
  }

  public onMultiTouch(
    pointA: Nullable<PointerTouch>,
    pointB: Nullable<PointerTouch>,
    previousPinchSquaredDistance: number,
    pinchSquaredDistance: number,
    previousMultiTouchPanPosition: Nullable<PointerTouch>,
    multiTouchPanPosition: Nullable<PointerTouch>
  ): void {
    if (previousPinchSquaredDistance === 0 && previousMultiTouchPanPosition === null) {
      return;
    }
    if (pinchSquaredDistance === 0 && multiTouchPanPosition === null) {
      return;
    }

    if (this.multiTouchPanAndZoom) {
      this._computePinchZoom(previousPinchSquaredDistance, pinchSquaredDistance);
      this._computeMultiTouchPanning(previousMultiTouchPanPosition, multiTouchPanPosition);
    } else if (this.multiTouchPanning && this.pinchZoom) {
      this._twoFingerActivityCount++;

      if (
        this._isPinching ||
        (this._twoFingerActivityCount < 20 &&
          Math.abs(Math.sqrt(pinchSquaredDistance) - Math.sqrt(previousPinchSquaredDistance)) >
            this.camera.pinchToPanMaxDistance)
      ) {
        this._computePinchZoom(previousPinchSquaredDistance, pinchSquaredDistance);
        this._isPinching = true;
      } else {
        this._computeMultiTouchPanning(previousMultiTouchPanPosition, multiTouchPanPosition);
      }
    } else if (this.multiTouchPanning) {
      this._computeMultiTouchPanning(previousMultiTouchPanPosition, multiTouchPanPosition);
    } else if (this.pinchZoom) {
      this._computePinchZoom(previousPinchSquaredDistance, pinchSquaredDistance);
    }
  }

  public onButtonUp(): void {
    this._twoFingerActivityCount = 0;
    this._isPinching = false;
  }

  public onLostFocus(): void {
    this._twoFingerActivityCount = 0;
    this._isPinching = false;
  }
}
