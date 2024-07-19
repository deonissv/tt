import type { ActorMaterial } from './ActorMaterial';

export interface ActorModel extends ActorMaterial {
  meshURL: string;
  colliderURL?: string; // default: meshURL
}
