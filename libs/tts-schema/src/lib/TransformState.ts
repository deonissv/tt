import { z } from 'zod';
import { JsonFloatSchema } from './JointState';

export const TransformStateSchema = z
  .object({
    posX: JsonFloatSchema,
    posY: JsonFloatSchema,
    posZ: JsonFloatSchema,
    rotX: JsonFloatSchema,
    rotY: JsonFloatSchema,
    rotZ: JsonFloatSchema,
    scaleX: JsonFloatSchema,
    scaleY: JsonFloatSchema,
    scaleZ: JsonFloatSchema,
  })
  .meta({ id: 'TransformState', title: 'TransformState' });

export type TransformState = z.infer<typeof TransformStateSchema>;
