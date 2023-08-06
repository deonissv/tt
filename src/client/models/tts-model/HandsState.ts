import { TransformState } from './TransformState';

export interface HandsState {
  Enable: boolean;
  DisableUnused: boolean;
  Hiding: HidingType;
  HandTransforms: HandTransformState[];
}

export enum HidingType {
  Default, // only owner can see
  Reverse, // opposite of default
  Disable, // hiding is disabled
}

export interface HandTransformState {
  Color: string;
  Transform: TransformState;
}
