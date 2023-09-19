export interface PlaygroundState {
  leftHandedSystem?: boolean; // default: false | If true, the Y axis will be inverted, and the Z axis will be inverted
  gravity?: number; // default: -9.81

  actortStates: ActorState[]; // Objects on the table
}

export interface ActorState {
  name: string;
  guid: string;
  model: Model;

  scale?: number[]; // default: Vector3.One
  rotation?: number[]; // default: Vector3.Zero
  position?: number[]; // default: Vector3.Zero

  mass?: number; // default: 1
}

export interface Model {
  // @TODO extend https://doc.babylonjs.com/typedoc/classes/BABYLON.Material
  meshURL: string;
  colliderURL?: string; // default: meshURL

  diffuseURL?: string;
  ambientURL?: string;
  specularURL?: string;
  emissiveURL?: string;
  reflectionURL?: string;
  normalURL?: string; // BABYLON.StandardMaterial().bumpTexture;
  opacityURL?: string;
  lightmapURL?: string;
}
