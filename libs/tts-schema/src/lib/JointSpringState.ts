import { z } from 'zod';

/** `ObjectState.JointSpring` settings. Hinge joints use Unity's separate `JointSpring` type. */
export const JointSpringStateSchema = z
  .object({
    Damper: z.number(),
    MaxDistance: z.number(),
    MinDistance: z.number(),
    Spring: z.number(),
  })
  .meta({ id: 'JointSpringState', title: 'JointSpringState' });

export type JointSpringState = z.infer<typeof JointSpringStateSchema>;
