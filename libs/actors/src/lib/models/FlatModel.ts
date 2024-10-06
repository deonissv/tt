import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { SubMesh } from '@babylonjs/core/Meshes/subMesh';

import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';

export interface TextureBounds {
  texture: Texture;
  vertStart: number;
  vertCount: number;
  faceIndexStart: number;
  faceIndexCount: number;
}

export const FlatMoodel = (model: Mesh, faceTexture?: TextureBounds, backTexture?: TextureBounds): Mesh => {
  const mat = new MultiMaterial('card');

  const baseMat = new StandardMaterial('material');
  mat.subMaterials.push(baseMat);
  let matIndex = 0;

  if (faceTexture) {
    const matFace = new StandardMaterial('face');
    matFace.diffuseTexture = faceTexture.texture;
    new SubMesh(
      ++matIndex,
      faceTexture.vertStart,
      faceTexture.vertCount,
      faceTexture.faceIndexStart,
      faceTexture.faceIndexCount,
      model,
    );
    mat.subMaterials.push(matFace);
  }

  if (backTexture) {
    const matBack = new StandardMaterial('back');
    matBack.diffuseTexture = backTexture.texture;
    new SubMesh(
      ++matIndex,
      backTexture.vertStart,
      backTexture.vertCount,
      backTexture.faceIndexStart,
      backTexture.faceIndexCount,
      model,
    );
    mat.subMaterials.push(matBack);
  }

  model.material = mat;
  return model;
};
