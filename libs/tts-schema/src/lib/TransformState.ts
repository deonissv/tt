import { z } from 'zod';

export const TransformStateSchema = z
  .object({
    posX: z.number(),
    posY: z.number(),
    posZ: z.number(),
    rotX: z.number(),
    rotY: z.number(),
    rotZ: z.number(),
    scaleX: z.number(),
    scaleY: z.number(),
    scaleZ: z.number(),
  })
  .meta({ id: 'TransformState', title: 'TransformState' });

export type TransformState = z.infer<typeof TransformStateSchema>;
