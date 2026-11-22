import { z } from 'zod';
import { TransformStateSchema } from './TransformState';

export enum HidingType {
  Default, // only owner can see
  Reverse, // opposite of default
  Disable, // hiding is disabled
}

export const HandTransformStateSchema = z
  .object({
    Color: z.string(),
    Transform: TransformStateSchema,
  })
  .meta({ id: 'HandTransformState', title: 'HandTransformState' });

export type HandTransformState = z.infer<typeof HandTransformStateSchema>;

export const HandsStateSchema = z
  .object({
    Enable: z.boolean(),
    DisableUnused: z.boolean(),
    Hiding: z.nativeEnum(HidingType),
    HandTransforms: z.array(HandTransformStateSchema).optional(),
  })
  .meta({ id: 'HandsState', title: 'HandsState' });

export type HandsState = z.infer<typeof HandsStateSchema>;
