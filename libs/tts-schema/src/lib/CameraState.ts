import { z } from 'zod';
import { Vector3Schema } from './Vector3';

export const CameraStateSchema = z
  .object({
    Position: Vector3Schema,
    Rotation: Vector3Schema,
    Distance: z.number(),
    Zoomed: z.boolean(),
    AbsolutePosition: Vector3Schema.nullable().optional(), // Present when the camera was saved detached from a player seat
  })
  .meta({ id: 'CameraState', title: 'CameraState' });

export type CameraState = z.infer<typeof CameraStateSchema>;
