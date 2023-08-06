import { ColourState } from './ColourState';
import { Vector3 } from './Vector3';

export interface VectorLineState {
  points3: Vector3[];
  color: ColourState;
  thickness: number;
  rotation: Vector3;
  loop?: boolean;
  square?: boolean;
}
