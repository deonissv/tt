import { z } from 'zod';

/** Custom figurine object (`ObjectState.CustomFigurine`). */
export const CustomFigurineStateSchema = z
  .object({
    UseMinimalCollider: z.boolean(),
    MirroredBack: z.boolean(),
  })
  .meta({ id: 'CustomFigurineState', title: 'CustomFigurineState' });

export type CustomFigurineState = z.infer<typeof CustomFigurineStateSchema>;
