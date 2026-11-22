import { z } from 'zod';
import { urlString } from './url';

export const CustomDecalStateSchema = z
  .object({
    Name: z.string(),
    ImageURL: urlString(),
    Size: z.number(), //Size in inches
  })
  .meta({ id: 'CustomDecalState', title: 'CustomDecalState' });

export type CustomDecalState = z.infer<typeof CustomDecalStateSchema>;
