import { z } from 'zod';
import { Vector3Schema } from './Vector3';

export const SnapPointStateSchema = z
  .object({
    Position: Vector3Schema, //World position when not attached and local position when attached to an object
    Rotation: Vector3Schema.nullable().optional(), //Rotate is only set for rotation snap points
    Tags: z.array(z.string()).nullable().optional(), //Only objects carrying one of these tags snap to the point
  })
  .meta({ id: 'SnapPointState', title: 'SnapPointState' });

export type SnapPointState = z.infer<typeof SnapPointStateSchema>;
