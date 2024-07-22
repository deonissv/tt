import type { Material } from './Material';

export interface Model extends Material {
  meshURL: string;
  colliderURL?: string; // default: meshURL
}
