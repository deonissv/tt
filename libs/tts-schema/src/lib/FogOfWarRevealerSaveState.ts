import { z } from 'zod';

export const FogOfWarRevealerSaveStateSchema = z
  .object({
    Active: z.boolean(),
    ShowOutLine: z.boolean().optional(), // Outline the revealer volume
    Range: z.number(),
    Height: z.number().optional(),
    Color: z.string().optional(), // Hex colour of the outline
    FoV: z.number().optional(), // Field of view of the revealer
    FoVOffset: z.number().optional(),
  })
  .meta({ id: 'FogOfWarRevealerSaveState', title: 'FogOfWarRevealerSaveState' });

export type FogOfWarRevealerSaveState = z.infer<typeof FogOfWarRevealerSaveStateSchema>;
