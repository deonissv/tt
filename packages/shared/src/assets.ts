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

export const RECTANGLE_TABLE = {
  scaling: [79, 79, 79],
  frame: {
    meshURL: `${STATIC_HOST}/GreenFelt_Table.obj`,
    diffuseURL: `${STATIC_HOST}/GreenFeltTable_D.png`,
    specularURL: `${STATIC_HOST}/GreenFeltTable_S.png`,
    normalURL: `${STATIC_HOST}/GreenFeltTable_N.png`,
  },
  grid: {
    meshURL: `${STATIC_HOST}/GreenFelt_Table_Grid.obj`,
  },
};
