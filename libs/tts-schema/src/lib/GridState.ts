import { z } from 'zod';
import { ColourStateSchema } from './ColourState';
import { Vector3Schema } from './Vector3';

export enum GridType {
  Box,
  HexHorizontal,
  HexVertical,
}

export const GridStateSchema = z
  .object({
    Type: z.nativeEnum(GridType),
    Lines: z.boolean(),
    Color: ColourStateSchema,
    Opacity: z.number(),
    ThickLines: z.boolean(),
    Snapping: z.boolean(),
    Offset: z.boolean(),
    BothSnapping: z.boolean(),
    xSize: z.number(),
    ySize: z.number(),
    PosOffset: Vector3Schema,
  })
  .meta({ id: 'GridState', title: 'GridState' });

export type GridState = z.infer<typeof GridStateSchema>;
