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

export const CUSTOM_RECTANGLE_TABLE = {
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

export const RECTANGLE_TABLE = {
  scaling: [1.01, 1.01, 1.01],
  frame: {
    meshURL: `${STATIC_HOST}/rpg_table_wood2057.obj`,
    ...woodMaterialProps,
  },
  felt: {
    meshURL: `${STATIC_HOST}/rpg_table_felt.obj`,
    ...feltMaterialProps,
  },
  handles: {
    meshURL: `${STATIC_HOST}/rpg_table_handles.obj`,
  },
};

export const POKER_TABLE = {
  scaling: [40.5, 40.5, 40.5],
  frame: {
    meshURL: `${STATIC_HOST}/table_poker.obj`,
    diffuseURL: `${STATIC_HOST}/table_poker_diff.png`,
    specularURL: `${STATIC_HOST}/table_poker_spec.png`,
    normalURL: `${STATIC_HOST}/table_poker_nrm.png`,
  },
  legs: {
    meshURL: `${STATIC_HOST}/table_poker_legs.obj`,
    diffuseURL: `${STATIC_HOST}/table_poker_legs_diff.png`,
    normalURL: `${STATIC_HOST}/table_poker_legs_nrm.png`,
  },
};
