import type { ColourState } from './ColourState';

export interface LightingState {
  LightIntensity: number; // = 0.54f; //0-8
  LightColor: ColourState; // = new ColourState(1f, 0.9804f, 0.8902f);
  AmbientIntensity: number; // = 1.3f; //0-8
  AmbientType: AmbientType; // = AmbientType.Background;
  AmbientSkyColor: ColourState; // = new ColourState(0.5f, 0.5f, 0.5f);
  AmbientEquatorColor: ColourState; // = new ColourState(0.5f, 0.5f, 0.5f);
  AmbientGroundColor: ColourState; // = new ColourState(0.5f, 0.5f, 0.5f);
  ReflectionIntensity: number; // = 1f; //0-1
  LutIndex: number; // = 0;
  LutContribution: number; // = 1f; //0-1
  LutURL: string; //; //LUT 256x16
}

export enum AmbientType {
  Background,
  Gradient,
}

// export const LightingStateDefault: LightingState = {
//     lightIntensity: 0.54,
//     lightColor: {
//         r: 1,
//         g: 0.9804,
//         b: 0.8902
//     },
//     ambientIntensity: 1.3,
//     ambientType: AmbientType.Background,
//     ambientSkyColor: {
//         r: 0.5,
//         g: 0.5,
//         b: 0.5
//     },
//     ambientEquatorColor: {
//         r: 0.5,
//         g: 0.5,
//         b: 0.5
//     },
//     ambientGroundColor: {
//         r: 0.5,
//         g: 0.5,
//         b: 0.5
//     },
//     reflectionIntensity: 1,
//     lutIndex: 0,
//     lutContribution: 1,
//     lutURL: ""
// }
