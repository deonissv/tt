import { z } from 'zod';

/**
 * `ObjectState.LayoutZone.Options` controls layout behaviour.
 * Keep enum fields numeric to match the game's integer values.
 */
export const LayoutZoneOptionsSchema = z
  .object({
    /** 0 = RIGHT_THEN_DOWN, 1 = DOWN_THEN_RIGHT, 2 = LEFT_THEN_DOWN, 3 = DOWN_THEN_LEFT, 4 = RIGHT_THEN_UP, 5 = UP_THEN_RIGHT, 6 = LEFT_THEN_UP, 7 = UP_THEN_LEFT. */
    Direction: z.number(),
    MeldDirection: z.number(),
    NewObjectFacing: z.number(),
    TriggerForFaceUp: z.boolean(),
    TriggerForFaceDown: z.boolean(),
    TriggerForNonCards: z.boolean(),
    AllowSwapping: z.boolean(),
    MaxObjectsPerNewGroup: z.number(),
    MaxObjectsPerGroup: z.number(),
    MeldSort: z.number(),
    MeldReverseSort: z.boolean(),
    MeldSortExisting: z.boolean(),
    StickyCards: z.boolean(),
    HorizontalSpread: z.number(),
    VerticalSpread: z.number(),
    HorizontalGroupPadding: z.number(),
    VerticalGroupPadding: z.number(),
    SplitAddedDecks: z.boolean(),
    CombineIntoDecks: z.boolean(),
    CardsPerDeck: z.number(),
    AlternateDirection: z.boolean(),
    Randomize: z.boolean(),
    InstantRefill: z.boolean(),
    ManualOnly: z.boolean(),
  })
  .meta({ id: 'LayoutZoneOptions', title: 'LayoutZoneOptions' });

export type LayoutZoneOptions = z.infer<typeof LayoutZoneOptionsSchema>;
