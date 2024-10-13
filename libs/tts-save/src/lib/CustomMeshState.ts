import type { CustomShaderState } from './CustomShaderState';

export interface CustomMeshState {
  MeshURL: string;
  DiffuseURL: string;
  NormalURL: string;
  ColliderURL: string;
  Convex: boolean;
  MaterialIndex: number;
  TypeIndex: number;
  CustomShader: CustomShaderState;
  CastShadows: boolean;
}
