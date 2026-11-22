import { z } from 'zod';

export const TurnsStateSchema = z
  .object({
    Enable: z.boolean(),
    Type: z.number(), // 0 = Standard, 1 = Custom
    TurnOrder: z.array(z.string()).optional(),
    Reverse: z.boolean(),
    SkipEmpty: z.boolean(),
    DisableInteractions: z.boolean(),
    PassTurns: z.boolean(),
    TurnColor: z.string().optional(), // Absent when turn tracking has never been enabled
  })
  .meta({ id: 'TurnsState', title: 'TurnsState' });

export type TurnsState = z.infer<typeof TurnsStateSchema>;
