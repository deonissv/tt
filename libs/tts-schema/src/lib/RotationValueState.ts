import { z } from 'zod';
import { Vector3Schema } from './Vector3';

export const RotationValueStateSchema = z
  .object({
    /** Tooltip value shown at `Rotation`, such as dice face values "1" through "20". */
    Value: z.string(),
    Rotation: Vector3Schema,
  })
  .meta({ id: 'RotationValueState', title: 'RotationValueState' });

export type RotationValueState = z.infer<typeof RotationValueStateSchema>;
