import { ActorType, DieBaseState, Material, Model, TileType, Transformation } from '@tt/states';
import { degToRad, Tuple } from '@tt/utils';

export const AssetManagerProxy = (staticHost: string) => {
  const assetsPath = `${staticHost}/assets`;
  const feltMaterialProps: Material = {
    diffuseURL: `${assetsPath}/felt_diff.png`,
    normalURL: `${assetsPath}/felt_nrm.png`,
    specularURL: `${assetsPath}/felt_spec.png`,
  };

  const woodMaterialProps: Material = {
    diffuseURL: `${assetsPath}/wood_diff.png`,
    specularURL: `${assetsPath}/wood_spec.png`,
  };

  const CUSTOM_RECTANGLE_TABLE = {
    transformation: {
      position: [0, -23.2, 0],
      rotation: [0, 0, 0],
      scale: [79, 79, 79],
    } satisfies Transformation,
    frame: {
      meshURL: `${assetsPath}/GreenFelt_Table.obj`,
      diffuseURL: `${assetsPath}/GreenFeltTable_D.png`,
      specularURL: `${assetsPath}/GreenFeltTable_S.png`,
      normalURL: `${assetsPath}/GreenFeltTable_N.png`,
    },
    grid: {
      meshURL: `${assetsPath}/GreenFelt_Table_Grid.obj`,
    },
  };

  const RECTANGLE_TABLE = {
    // transformation: {
    //   position: [0, -1.4, 0],
    //   rotation: [(3 * Math.PI) / 2, 0, 0],
    //   scale: [1.01, 1.01, 1.01],
    // },
    frame: {
      meshURL: `${assetsPath}/rpg_table_wood.obj`,
      ...woodMaterialProps,
    },
    felt: {
      meshURL: `${assetsPath}/rpg_table_felt.obj`,
      ...feltMaterialProps,
    },
    handles: {
      meshURL: `${assetsPath}/rpg_table_handles.obj`,
    },
  };

  const POKER_TABLE = {
    transformation: {
      scale: [40.5, 40.5, 40.5],
      position: [0, -9.25, 0],
      rotation: [(3 * Math.PI) / 2, 0, 0],
    },
    frame: {
      meshURL: `${assetsPath}/table_poker.obj`,
      diffuseURL: `${assetsPath}/table_poker_diff.png`,
      specularURL: `${assetsPath}/table_poker_spec.png`,
      normalURL: `${assetsPath}/table_poker_nrm.png`,
    },
    legs: {
      meshURL: `${assetsPath}/table_poker_legs.obj`,
      diffuseURL: `${assetsPath}/table_poker_legs_diff.png`,
      normalURL: `${assetsPath}/table_poker_legs_nrm.png`,
    },
  };

  const OCTAGON_TABLE = {
    transformation: {
      position: [0, -0.65, 0],
      rotation: [(6 * Math.PI) / 4, degToRad(22.5), 0],
      scale: Array(3).fill(1.04) as Tuple<number, 3>,
    } satisfies Transformation,
    leg: {
      meshURL: `${assetsPath}/Legs.obj`,
      diffuseURL: `${assetsPath}/wood_diff.png`,
      specularURL: `${assetsPath}/wood_spec.png`,
    },
    top: {
      meshURL: `${assetsPath}/OctagonTable_wood1992.obj`,
      diffuseURL: `${assetsPath}/wood_diff.png`,
      specularURL: `${assetsPath}/wood_spec.png`,
      // diffuseURL: `${statisHost}/OctagonTable_diff.png`,
      // normalURL: `${statisHost}/OctagonTable_nrm.png`,
      // specularURL: `${statisHost}/OctagonTable_spec.png`,
    },
  };

  const CUSTOM_SQUARE_TABLE = {
    transformation: {
      position: [0, -51.3, 0],
      rotation: [0, 0, 0],
      scale: [60.5, 60.5, 60.5],
    } satisfies Transformation,
    frame: {
      meshURL: `${assetsPath}/table_square.obj`,
      diffuseURL: `${assetsPath}/table_square_myMaterial1_Diffuse.png`,
      normalURL: `${assetsPath}/table_square_myMaterial1_Normal.png`,
      specularURL: `${assetsPath}/table_square_myMaterial1_Spec_Gloss.png`,
    },
  };

  const SQUARE_TABLE_MODEL = {
    transformation: {
      position: [0, -34.8, 0],
      rotation: [(6 * Math.PI) / 4, 0, 0],
      scale: [1, 1, 1],
    } satisfies Transformation,
    frame: {
      meshURL: `${assetsPath}/TableSquare.obj`,
      //   diffuseURL: `${statisHost}/table_square_myMaterial1_Diffuse.png`,
      //   normalURL: `${statisHost}/table_square_myMaterial1_Normal.png`,
      //   specularURL: `${statisHost}/table_square_myMaterial1_Spec_Gloss.png`,
      diffuseURL: `${assetsPath}/Table02_diff.png`,
      specularURL: `${assetsPath}/Table02_spec.png`,
      normalURL: `${assetsPath}/Table02_nrm.png`,
    },
  };
  const GLASS_TABLE_MODEL = {
    transformation: {
      position: [0, -3, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [38, 38, 38],
    } satisfies Transformation,
    metal: {
      meshURL: `${assetsPath}/glass_table_metal.obj`,
      diffuseURL: `${assetsPath}/metal_diff.png`,
    },
    glassMid: {
      meshURL: `${assetsPath}/glass_table_mid.obj`,
      diffuseURL: `${assetsPath}/metal_diff.png`,
    },
    glassTop: {
      meshURL: `${assetsPath}/glass_table_top_bottom.obj`,
      normalURL: `${assetsPath}/glass_table_N.png`,
    } satisfies Model,
  };

  const CIRCLE_TABLE_MODEL = {
    transformation: {
      position: [0, -18, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    } satisfies Transformation,
    glass: {
      meshURL: `${assetsPath}/glass.obj`,
    },
    legs: {
      meshURL: `${assetsPath}/legs2088.obj`,
      ...woodMaterialProps,
    },
    top: {
      meshURL: `${assetsPath}/table_top2064.obj`,
      ...woodMaterialProps,
    },
  };

  const HEX_TABLE_MODEL = {
    transformation: {
      position: [0, -0.5, 0],
      rotation: [(6 * Math.PI) / 4, Math.PI / 6, 0],
      scale: [0.94, 0.94, 0.94],
    } satisfies Transformation,
    leg: {
      meshURL: `${assetsPath}/Legs.obj`,
      diffuseURL: `${assetsPath}/wood_diff.png`,
      specularURL: `${assetsPath}/wood_spec.png`,
    },
    top: {
      meshURL: `${assetsPath}/HexagonTable_wood.obj`,
      diffuseURL: `${assetsPath}/wood_diff.png`,
      specularURL: `${assetsPath}/wood_spec.png`,
      // diffuseURL: `${statisHost}/HexagonTable_diff.png`,
      // normalURL: `${statisHost}/HexagonTable_nrm.png`,
      // specularURL: `${statisHost}/HexagonTable_spec.png`,
    },
  };

  const BAG_MODEL = {
    transformation: {
      position: [0, Math.PI / 2, 0],
      rotation: [(6 * Math.PI) / 4, Math.PI / 6, 0],
      scale: [1, 1, 1],
    },
    meshURL: `${assetsPath}/Group1.obj`,
    normalURL: `${assetsPath}/bag_N.png`,
    specularURL: `${assetsPath}/bag_S.png`,
    diffuseURL: `${assetsPath}/2-bag_D_gray.png`,
    colliderURL: `${assetsPath}/bag_opened.obj`,
  };

  const DIE_TEXTURES = {
    normalURL: `${assetsPath}/NEW-Dice_nrm strong.png`,
    specularURL: `${assetsPath}/Dice_spec 1_gray.png`,
    diffuseURL: `${assetsPath}/Dice_colored_diff 1.png`,
  };

  const DIE4_MODEL = {
    meshURL: `${assetsPath}/Tetrahedron.obj`,
    colliderURL: `${assetsPath}/Tetrahedron_colision.obj`,
    ...DIE_TEXTURES,
  } satisfies Model;

  const DIE6_MODEL = {
    meshURL: `${assetsPath}/Cube.obj`,
    colliderURL: `${assetsPath}/Cube.obj`,
    ...DIE_TEXTURES,
  } satisfies Model;

  const DIE8_MODEL = {
    ...DIE_TEXTURES,
    meshURL: `${assetsPath}/Octahedron.obj`,
    colliderURL: `${assetsPath}/Octahedron_colision.obj`,
  } satisfies Model;

  const DIE10_MODEL = {
    ...DIE_TEXTURES,
    meshURL: `${assetsPath}/Trapezohedron.obj`,
    colliderURL: `${assetsPath}/Trapezohedron_colision.obj`,
  } satisfies Model;

  const DIE12_MODEL = {
    ...DIE_TEXTURES,
    meshURL: `${assetsPath}/Dodecahedron.obj`,
    colliderURL: `${assetsPath}/Dodecahedron_colision.obj`,
  } satisfies Model;

  const DIE20_MODEL = {
    ...DIE_TEXTURES,
    meshURL: `${assetsPath}/Icosahedron.obj`,
    colliderURL: `${assetsPath}/icosahedron23294.obj`,
  } satisfies Model;

  const PAWN_TOKEN_MODEL = {
    meshURL: `${assetsPath}/PawnToken.obj`,
  } satisfies Model;

  const ROUNDED_DIE = {
    meshURL: `${assetsPath}/Rounded_Dice.obj`,
    colliderURL: `${assetsPath}/Rounded_Dice.obj`,
    diffuseURL: `${assetsPath}/Rounded_Dice(Dots).png`,
    normalURL: `${assetsPath}/Rounded_Dice_normal.png`,
  } satisfies Model;

  const getDieModel = (state: DieBaseState) => {
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

  const HEX_TILE_URL = `${assetsPath}/hex_tile.obj`;
  const ROUND_TILE_URL = `${assetsPath}/round_tile.obj`;
  const SQUARE_TILE_URL = `${assetsPath}/square_tile.obj`;
  const CARD_MODEL_URL = `${assetsPath}/Card.obj`;

  const getTileMesh = (type: TileType): string => {
    switch (type) {
      case TileType.BOX: {
        return SQUARE_TILE_URL;
      }
      case TileType.HEX: {
        return HEX_TILE_URL;
      }
      case TileType.CIRCLE: {
        return ROUND_TILE_URL;
      }
      case TileType.ROUNDED: {
        return SQUARE_TILE_URL;
      }
    }
  };

  return {
    feltMaterialProps,
    woodMaterialProps,
    CUSTOM_RECTANGLE_TABLE,
    RECTANGLE_TABLE,
    POKER_TABLE,
    OCTAGON_TABLE,
    CUSTOM_SQUARE_TABLE,
    SQUARE_TABLE_MODEL,
    GLASS_TABLE_MODEL,
    CIRCLE_TABLE_MODEL,
    HEX_TABLE_MODEL,
    BAG_MODEL,
    PAWN_TOKEN_MODEL,
    ROUNDED_DIE,
    getDieModel,
    getTileMesh,
    CARD_MODEL_URL,
  };
};
