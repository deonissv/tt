import { z } from 'zod';
import { urlString } from './url';

export enum DiceType {
  D4,
  D6,
  D8,
  D10,
  D12,
  D20,
}

export enum TileType {
  Box = 0,
  Hex = 1,
  Circle = 2,
  Rounded = 3,
}

export const CustomDiceStateSchema = z
  .object({
    Type: z.nativeEnum(DiceType),
  })
  .meta({ id: 'CustomDiceState', title: 'CustomDiceState' });

export type CustomDiceState = z.infer<typeof CustomDiceStateSchema>;

export const CustomTokenStateSchema = z
  .object({
    Thickness: z.number(),
    MergeDistancePixels: z.number(),
    StandUp: z.boolean().optional(),
    Stackable: z.boolean(),
  })
  .meta({ id: 'CustomTokenState', title: 'CustomTokenState' });

export type CustomTokenState = z.infer<typeof CustomTokenStateSchema>;

export const CustomJigsawPuzzleStateSchema = z
  .object({
    NumPuzzlePieces: z.number(), // default 80
    ImageOnBoard: z.boolean(),
  })
  .meta({ id: 'CustomJigsawPuzzleState', title: 'CustomJigsawPuzzleState' });

export type CustomJigsawPuzzleState = z.infer<typeof CustomJigsawPuzzleStateSchema>;

export const CustomTileStateSchema = z
  .object({
    Type: z.nativeEnum(TileType), //0 = Box, 1 = Hex, 2 = Circle, 3 = Rounded
    Thickness: z.number(),
    Stackable: z.boolean(),
    Stretch: z.boolean(),
  })
  .meta({ id: 'CustomTileState', title: 'CustomTileState' });

export type CustomTileState = z.infer<typeof CustomTileStateSchema>;

export const CustomImageStateSchema = z
  .object({
    ImageURL: urlString(),
    ImageSecondaryURL: urlString().optional(),
    ImageScalar: z.number().optional(), // Multiplier applied to the image-derived object size
    WidthScale: z.number().optional(), //Holds the scaled size of the object based on the image dimensions
    CustomDice: CustomDiceStateSchema.optional(),
    CustomToken: CustomTokenStateSchema.optional(),
    CustomJigsawPuzzle: CustomJigsawPuzzleStateSchema.optional(),
    CustomTile: CustomTileStateSchema.optional(),
  })
  .meta({ id: 'CustomImageState', title: 'CustomImageState' });

export type CustomImageState = z.infer<typeof CustomImageStateSchema>;
