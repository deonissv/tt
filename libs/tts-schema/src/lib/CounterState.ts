import { z } from 'zod';

export const CounterStateSchema = z
  .object({
    value: z.number(),
  })
  .meta({ id: 'CounterState', title: 'CounterState' });

export type CounterState = z.infer<typeof CounterStateSchema>;
