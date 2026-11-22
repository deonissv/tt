import { z } from 'zod';
import { ColourStateSchema } from './ColourState';
import { SteamIdSchema } from './SteamId';

export const TextStateSchema = z
  .object({
    Text: z.string(),
    OwnerSteamID: SteamIdSchema.optional(), // Steam id of the player who wrote the label
    colorstate: ColourStateSchema.nullable().optional(),
    fontSize: z.number(), // int = 64;
  })
  .meta({ id: 'TextState', title: 'TextState' });

export type TextState = z.infer<typeof TextStateSchema>;
