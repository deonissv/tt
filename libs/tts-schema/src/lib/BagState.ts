import { z } from 'zod';

/**
 * `ObjectState.Bag` settings. Bags store their contents in `ContainedObjects`.
 * Infinite bags use the "Infinite" TypeIndex on their mesh.
 */
export const BagStateSchema = z
  .object({
    /** Stacking or insertion order flag. Observed saves use 0. */
    Order: z.number(),
  })
  .meta({ id: 'BagState', title: 'BagState' });

export type BagState = z.infer<typeof BagStateSchema>;
