import type { ColourState } from './ColourState';
import type { Vector3 } from './Vector3';

export interface GridState {
  Type: GridType;
  Lines: boolean;
  Color: ColourState;
  Opacity: number;
  ThickLines: boolean;
  Snapping: boolean;
  Offset: boolean;
  BothSnapping: boolean;
  xSize: number;
  ySize: number;
  PosOffset: Vector3;
}

export enum GridType {
  Box,
  HexHorizontal,
  HexVertical,
}
