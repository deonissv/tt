import type { Tuple } from '@babylonjs/core';
import { STATIC_HOST } from './constants';
import type { Material, Transformation } from './dto/states';
import { degToRad } from './utils';

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
  transformation: {
    position: [0, -23.2, 0],
    rotation: [0, 0, 0],
    scale: [79, 79, 79],
  } satisfies Transformation,
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
  transformation: {
    position: [0, -1.4, 0],
    rotation: [(3 * Math.PI) / 2, 0, 0],
    scale: [1.01, 1.01, 1.01],
  },
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
  transformation: {
    scale: [40.5, 40.5, 40.5],
    position: [0, -9.25, 0],
    rotation: [(3 * Math.PI) / 2, 0, 0],
  },
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

export const OCTAGON_TABLE = {
  transformation: {
    position: [0, -0.65, 0],
    rotation: [(6 * Math.PI) / 4, degToRad(22.5), 0],
    scale: Array(3).fill(1.04) as Tuple<number, 3>,
  } satisfies Transformation,
  leg: {
    meshURL: `${STATIC_HOST}/Legs.obj`,
    diffuseURL: `${STATIC_HOST}/wood_diff.png`,
    specularURL: `${STATIC_HOST}/wood_spec.png`,
  },
  top: {
    meshURL: `${STATIC_HOST}/OctagonTable_wood1992.obj`,
    diffuseURL: `${STATIC_HOST}/wood_diff.png`,
    specularURL: `${STATIC_HOST}/wood_spec.png`,
    // diffuseURL: `${STATIC_HOST}/OctagonTable_diff.png`,
    // normalURL: `${STATIC_HOST}/OctagonTable_nrm.png`,
    // specularURL: `${STATIC_HOST}/OctagonTable_spec.png`,
  },
};

export const CUSTOM_SQUARE_TABLE = {
  transformation: {
    position: [0, -51.3, 0],
    rotation: [0, 0, 0],
    scale: [60.5, 60.5, 60.5],
  } satisfies Transformation,
  frame: {
    meshURL: `${STATIC_HOST}/table_square.obj`,
    diffuseURL: `${STATIC_HOST}/table_square_myMaterial1_Diffuse.png`,
    normalURL: `${STATIC_HOST}/table_square_myMaterial1_Normal.png`,
    specularURL: `${STATIC_HOST}/table_square_myMaterial1_Spec_Gloss.png`,
  },
};

export const SQUARE_TABLE_MODEL = {
  transformation: {
    position: [0, -34.8, 0],
    rotation: [(6 * Math.PI) / 4, 0, 0],
    scale: [1, 1, 1],
  } satisfies Transformation,
  frame: {
    meshURL: `${STATIC_HOST}/TableSquare.obj`,
    //   diffuseURL: `${STATIC_HOST}/table_square_myMaterial1_Diffuse.png`,
    //   normalURL: `${STATIC_HOST}/table_square_myMaterial1_Normal.png`,
    //   specularURL: `${STATIC_HOST}/table_square_myMaterial1_Spec_Gloss.png`,
    diffuseURL: `${STATIC_HOST}/Table02_diff.png`,
    specularURL: `${STATIC_HOST}/Table02_spec.png`,
    normalURL: `${STATIC_HOST}/Table02_nrm.png`,
  },
};
export const GLASS_TABLE_MODEL = {
  transformation: {
    position: [0, -3, 0],
    rotation: [Math.PI / 2, 0, 0],
    scale: [38, 38, 38],
  } satisfies Transformation,
  metal: {
    meshURL: `${STATIC_HOST}/glass_table_metal.obj`,
    diffuseURL: `${STATIC_HOST}/metal_diff.png`,
  },
  glassMid: {
    meshURL: `${STATIC_HOST}/glass_table_mid.obj`,
    diffuseURL: `${STATIC_HOST}/metal_diff.png`,
  },
  glassTop: {
    meshURL: `${STATIC_HOST}/glass_table_top_bottom.obj`,
    diffuseURL: `${STATIC_HOST}/glass_table_N.png`,
  },
};
