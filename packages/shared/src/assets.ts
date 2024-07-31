import { STATIC_HOST } from './constants';
import type { Material } from './dto/states';

export const feltMaterialProps: Material = {
  diffuseURL: `${STATIC_HOST}/felt_diff.png`,
  normalURL: `${STATIC_HOST}/felt_nrm.png`,
  specularURL: `${STATIC_HOST}/felt_spec.png`,
};

export const woodMaterialProps: Material = {
  diffuseURL: `${STATIC_HOST}/wood_diff.png`,
  specularURL: `${STATIC_HOST}/wood_spec.png`,
};
