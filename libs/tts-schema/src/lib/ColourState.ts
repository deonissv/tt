import { z } from 'zod';

export const ColourStateSchema = z
  .object({
    r: z.number(),
    g: z.number(),
    b: z.number(),
    a: z.number().nullable().optional(),
  })
  .meta({ id: 'ColourState', title: 'ColourState' });

export type ColourState = z.infer<typeof ColourStateSchema>;
