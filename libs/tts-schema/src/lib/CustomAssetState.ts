import { z } from 'zod';
import { urlString } from './url';

export const CustomAssetStateSchema = z
  .object({
    Type: z.number(), // UI asset kind. Observed saves use 0
    Name: z.string(),
    URL: urlString(),
  })
  .meta({ id: 'CustomAssetState', title: 'CustomAssetState' });

export type CustomAssetState = z.infer<typeof CustomAssetStateSchema>;
