import { z } from 'zod';
import { ColourStateSchema } from './ColourState';
import { Vector3Schema } from './Vector3';
import { SteamIdSchema } from './SteamId';

export const VectorLineStateSchema = z
  .object({
    OwnerSteamID: SteamIdSchema.optional(), // Steam id of the player who drew the line
    points3: z.array(Vector3Schema),
    color: ColourStateSchema,
    thickness: z.number(),
    rotation: Vector3Schema.nullable().optional(),
    loop: z.boolean().nullable().optional(),
    square: z.boolean().nullable().optional(),
  })
  .meta({ id: 'VectorLineState', title: 'VectorLineState' });

export type VectorLineState = z.infer<typeof VectorLineStateSchema>;
