import { z } from 'zod';

export const RigidbodyStateSchema = z
  .object({
    Mass: z.number(),
    Drag: z.number(),
    AngularDrag: z.number(),
    UseGravity: z.boolean(),
  })
  .meta({ id: 'RigidbodyState', title: 'RigidbodyState' });

export type RigidbodyState = z.infer<typeof RigidbodyStateSchema>;
