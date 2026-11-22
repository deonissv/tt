import { z } from 'zod';

export const Vector3Schema = z
  .object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  })
  .meta({ id: 'Vector3', title: 'Vector3' });

export type Vector3 = z.infer<typeof Vector3Schema>;
