import { z } from 'zod';
import { urlString } from './url';

export const CustomAssetbundleStateSchema = z
  .object({
    AssetbundleURL: urlString(),
    AssetbundleSecondaryURL: urlString().optional(),
    MaterialIndex: z.number(), //0 = Plastic, 1 = Wood, 2 = Metal, 3 = Cardboard
    TypeIndex: z.number(), //0 = Generic, 1 = Figurine, 2 = Dice, 3 = Coin, 4 = Board, 5 = Chip, 6 = Bag, 7 = Infinite
    LoopingEffectIndex: z.number(),
  })
  .meta({ id: 'CustomAssetbundleState', title: 'CustomAssetbundleState' });

export type CustomAssetbundleState = z.infer<typeof CustomAssetbundleStateSchema>;
