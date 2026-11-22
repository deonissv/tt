import { z } from 'zod';
import { CustomShaderStateSchema } from './CustomShaderState';
import { urlString } from './url';

export const CustomMeshStateSchema = z
  .object({
    MeshURL: urlString(),
    DiffuseURL: urlString(),
    NormalURL: urlString().optional(),
    ColliderURL: urlString().optional(),
    Convex: z.boolean(),
    MaterialIndex: z.number(), //0 = Plastic, 1 = Wood, 2 = Metal, 3 = Cardboard
    TypeIndex: z.number(), //0 = Generic, 1 = Figurine, 2 = Dice, 3 = Coin, 4 = Board, 5 = Chip, 6 = Bag, 7 = Infinite
    CustomShader: CustomShaderStateSchema.optional(),
    CastShadows: z.boolean().optional(),
  })
  .meta({ id: 'CustomMeshState', title: 'CustomMeshState' });

export type CustomMeshState = z.infer<typeof CustomMeshStateSchema>;
