import { z } from 'zod';
import { urlString } from './url';

export const CustomDeckStateSchema = z
  .object({
    FaceURL: urlString(),
    BackURL: urlString(),
    NumWidth: z.number().optional(), // Cards per row on the face sheet
    NumHeight: z.number().optional(), // Card rows on the face sheet
    Type: z.number().optional(), // 0 = deck, 1 = single card, 4 observed on empty decks
    BackIsHidden: z.boolean(), //Back of cards becomes the hidden card when in a hand
    UniqueBack: z.boolean(), //Each back is a unique card just like the front
  })
  .meta({ id: 'CustomDeckState', title: 'CustomDeckState' });

export type CustomDeckState = z.infer<typeof CustomDeckStateSchema>;
