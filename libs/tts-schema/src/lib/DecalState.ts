import { z } from 'zod';
import { CustomDecalStateSchema } from './CustomDecalState';
import { TransformStateSchema } from './TransformState';
import { SteamIdSchema } from './SteamId';

export const DecalStateSchema = z
  .object({
    Transform: TransformStateSchema,
    CustomDecal: CustomDecalStateSchema,
    OwnerSteamID: SteamIdSchema.optional(), // Steam id of the player who placed the decal
  })
  .meta({ id: 'DecalState', title: 'DecalState' });

export type DecalState = z.infer<typeof DecalStateSchema>;
