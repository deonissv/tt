import { z } from 'zod';
import { ColourStateSchema } from './ColourState';

export const TabStateSchema = z
  .object({
    title: z.string(),
    body: z.string(),
    color: z.string(),
    visibleColor: ColourStateSchema,
    id: z.number(),
  })
  .meta({ id: 'TabState', title: 'TabState' });

export type TabState = z.infer<typeof TabStateSchema>;
