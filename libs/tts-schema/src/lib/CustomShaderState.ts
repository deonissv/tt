import { z } from 'zod';
import { ColourStateSchema } from './ColourState';

export const CustomShaderStateSchema = z
  .object({
    SpecularColor: ColourStateSchema,
    SpecularIntensity: z.number(),
    SpecularSharpness: z.number(), // Range 2-8
    FresnelStrength: z.number(), // Range 0-1
  })
  .meta({ id: 'CustomShaderState', title: 'CustomShaderState' });

export type CustomShaderState = z.infer<typeof CustomShaderStateSchema>;
