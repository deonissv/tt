import { z } from 'zod';

export const CalculatorStateSchema = z
  .object({
    value: z.string(),
    memory: z.number(),
  })
  .meta({ id: 'CalculatorState', title: 'CalculatorState' });

export type CalculatorState = z.infer<typeof CalculatorStateSchema>;
