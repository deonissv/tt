import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';

const getGlassMaterial = () => {
  const glassMaterial = new StandardMaterial('glass');
  glassMaterial.alpha = 0.5;
  glassMaterial.diffuseColor = new Color3(0, 0, 0.1);
  return glassMaterial;
};

export { getGlassMaterial };
