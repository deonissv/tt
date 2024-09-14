import type { Tuple } from '@babylonjs/core/types';
import { STATIC_HOST } from './constants';
import type { DieState } from './dto/states';
import { ActorType, type Material, type Model, type Transformation } from './dto/states';
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
  // transformation: {
  //   position: [0, -1.4, 0],
  //   rotation: [(3 * Math.PI) / 2, 0, 0],
  //   scale: [1.01, 1.01, 1.01],
  // },
  frame: {
    meshURL: `${STATIC_HOST}/rpg_table_wood.obj`,
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

export const CIRCLE_TABLE_MODEL = {
  transformation: {
    position: [0, -18, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  } satisfies Transformation,
  glass: {
    meshURL: `${STATIC_HOST}/glass.obj`,
  },
  legs: {
    meshURL: `${STATIC_HOST}/legs2088.obj`,
    ...woodMaterialProps,
  },
  top: {
    meshURL: `${STATIC_HOST}/table_top2064.obj`,
    ...woodMaterialProps,
  },
};

export const HEX_TABLE_MODEL = {
  transformation: {
    position: [0, -0.5, 0],
    rotation: [(6 * Math.PI) / 4, Math.PI / 6, 0],
    scale: [0.94, 0.94, 0.94],
  } satisfies Transformation,
  leg: {
    meshURL: `${STATIC_HOST}/Legs.obj`,
    diffuseURL: `${STATIC_HOST}/wood_diff.png`,
    specularURL: `${STATIC_HOST}/wood_spec.png`,
  },
  top: {
    meshURL: `${STATIC_HOST}/HexagonTable_wood.obj`,
    diffuseURL: `${STATIC_HOST}/wood_diff.png`,
    specularURL: `${STATIC_HOST}/wood_spec.png`,
    // diffuseURL: `${STATIC_HOST}/HexagonTable_diff.png`,
    // normalURL: `${STATIC_HOST}/HexagonTable_nrm.png`,
    // specularURL: `${STATIC_HOST}/HexagonTable_spec.png`,
  },
};

export const BAG_MODEL = {
  transformation: {
    position: [0, Math.PI / 2, 0],
    rotation: [(6 * Math.PI) / 4, Math.PI / 6, 0],
    scale: [1, 1, 1],
  },
  meshURL: `${STATIC_HOST}/Group1.obj`,
  normalURL: `${STATIC_HOST}/bag_N.png`,
  specularURL: `${STATIC_HOST}/bag_S.png`,
  diffuseURL: `${STATIC_HOST}/2-bag_D_gray.png`,
  colliderURL: `${STATIC_HOST}/bag_opened.obj`,
};

export const DIE_TEXTURES = {
  normalURL: `${STATIC_HOST}/NEW-Dice_nrm strong.png`,
  specularURL: `${STATIC_HOST}/Dice_spec 1_gray.png`,
  diffuseURL: `${STATIC_HOST}/Dice_colored_diff 1.png`,
};

export const DIE4_MODEL = {
  meshURL: `${STATIC_HOST}/Tetrahedron.obj`,
  colliderURL: `${STATIC_HOST}/Tetrahedron_colision.obj`,
  ...DIE_TEXTURES,
} satisfies Model;

export const DIE6_MODEL = {
  meshURL: `${STATIC_HOST}/Cube.obj`,
  colliderURL: `${STATIC_HOST}/Cube23284.obj`,
  ...DIE_TEXTURES,
} satisfies Model;

export const DIE8_MODEL = {
  ...DIE_TEXTURES,
  meshURL: `${STATIC_HOST}/Octahedron.obj`,
  colliderURL: `${STATIC_HOST}/Octahedron_colision.obj`,
} satisfies Model;

export const DIE10_MODEL = {
  ...DIE_TEXTURES,
  meshURL: `${STATIC_HOST}/Trapezohedron.obj`,
  colliderURL: `${STATIC_HOST}/Trapezohedron_colision.obj`,
} satisfies Model;

export const DIE12_MODEL = {
  ...DIE_TEXTURES,
  meshURL: `${STATIC_HOST}/Dodecahedron.obj`,
  colliderURL: `${STATIC_HOST}/Dodecahedron_colision.obj`,
} satisfies Model;

export const DIE20_MODEL = {
  ...DIE_TEXTURES,
  meshURL: `${STATIC_HOST}/Icosahedron.obj`,
  colliderURL: `${STATIC_HOST}/icosahedron23294.obj`,
} satisfies Model;

export const PAWN_TOKEN_MODEL = {
  meshURL: `${STATIC_HOST}/PawnToken.obj`,
} satisfies Model;

export const getDieModel = (state: DieState) => {
  switch (state.type) {
    case ActorType.DIE4:
      return DIE4_MODEL;
    case ActorType.DIE6:
      return DIE6_MODEL;
    case ActorType.DIE8:
      return DIE8_MODEL;
    case ActorType.DIE10:
      return DIE10_MODEL;
    case ActorType.DIE12:
      return DIE12_MODEL;
    case ActorType.DIE20:
      return DIE20_MODEL;
    default:
      throw new Error('Unknown die');
  }
};
