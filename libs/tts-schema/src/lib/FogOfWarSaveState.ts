import { z } from 'zod';

export const FogOfWarSaveStateSchema = z
  .object({
    HideGmPointer: z.boolean(),
    HideObjects: z.boolean(),
    ReHideObjects: z.boolean().optional(), // Re-hide objects that left the zone and returned
    Height: z.number(),
    RevealedLocations: z.record(z.string(), z.array(z.number())), // public Dictionary<string, HashSet<int>> RevealedLocations;
  })
  .meta({ id: 'FogOfWarSaveState', title: 'FogOfWarSaveState' });

export type FogOfWarSaveState = z.infer<typeof FogOfWarSaveStateSchema>;
