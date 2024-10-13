export interface Material {
  // https://doc.babylonjs.com/typedoc/classes/BABYLON.Material
  diffuseURL?: string;
  ambientURL?: string;
  specularURL?: string;
  emissiveURL?: string;
  reflectionURL?: string;
  normalURL?: string; // BABYLON.StandardMaterial().bumpTexture;
  opacityURL?: string;
  lightMapURL?: string;
}
