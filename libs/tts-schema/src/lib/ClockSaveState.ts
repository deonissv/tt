import { z } from 'zod';

export enum ClockState {
  Active = 0,
  Filling = 1,
  Stopped = 2,
}

export const ClockSaveStateSchema = z
  .object({
    Mode: z.nativeEnum(ClockState),
    SecondsPassed: z.number(),
    Paused: z.boolean(),
  })
  .meta({ id: 'ClockSaveState', title: 'ClockSaveState' });

export type ClockSaveState = z.infer<typeof ClockSaveStateSchema>;
