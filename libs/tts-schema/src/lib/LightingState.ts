import { z } from 'zod';
import { ColourStateSchema } from './ColourState';
import { urlString } from './url';

export enum AmbientType {
  Background,
  Gradient,
}

export const LightingStateSchema = z
  .object({
    LightIntensity: z.number(), // = 0.54f; //0-8
    LightColor: ColourStateSchema, // = new ColourState(1f, 0.9804f, 0.8902f);
    AmbientIntensity: z.number(), // = 1.3f; //0-8
    AmbientType: z.nativeEnum(AmbientType), // = AmbientType.Background;
    AmbientSkyColor: ColourStateSchema, // = new ColourState(0.5f, 0.5f, 0.5f);
    AmbientEquatorColor: ColourStateSchema, // = new ColourState(0.5f, 0.5f, 0.5f);
    AmbientGroundColor: ColourStateSchema, // = new ColourState(0.5f, 0.5f, 0.5f);
    ReflectionIntensity: z.number(), // = 1f; //0-1
    LutIndex: z.number(), // = 0;
    LutContribution: z.number(), // = 1f; //0-1
    LutURL: urlString().optional(), //; //LUT 256x16
  })
  .meta({ id: 'LightingState', title: 'LightingState' });

export type LightingState = z.infer<typeof LightingStateSchema>;
