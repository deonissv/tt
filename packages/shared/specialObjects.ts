import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

type CreateCallback = (url?: string) => Promise<TransformNode | null>;

export interface SpecialObjectsMapper {
  // tables: 'glass' | 'hexagon' | 'octagon' | 'rectangle_custom' | 'round' | 'square';
  tables: 'rectangleCustom';
  //   dice: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  //   cards: '6' | '7' | '8' | '9' | '10';
}

export interface SpecialObjects
  extends Record<
    keyof SpecialObjectsMapper,
    Record<SpecialObjectsMapper[keyof SpecialObjectsMapper], CreateCallback>
  > {}

// export interface ISpecialObjects {
//   tables: Record<Tables, CreateCallback>;
//   dice: Record<Dice, CreateCallback>;
// }

// export const SpecialObjects: ISpecialObjects = {
//   tables: {
//     Table_custom: {
//       meshes: [
//         'tables/rectangle_custom/rpg_table_wood.obj',
//         'tables/rectangle_custom/rpg_table_felt.obj',
//         'tables/rectangle_custom/rpg_table_handles.obj',
//       ],
//       textures: [
//         'tables/rectangle_custom/rpg_table_prop_diff.png',
//         'tables/rectangle_custom/rpg_table_prop_spec.png',
//         'tables/rectangle_custom/rpg_table_prop_nrm.png',
//       ],
//     },
//   },
// };
