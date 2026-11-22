import { z } from 'zod';
import { LayoutZoneOptionsSchema } from './LayoutZoneOptions';

/** Layout zone object (`ObjectState.LayoutZone`). Zones auto-arrange contained objects. */
export const LayoutZoneStateSchema = z
  .object({
    Options: LayoutZoneOptionsSchema,
    /** Object GUIDs currently grouped by the zone, outer list per group. */
    GroupsInZone: z.array(z.array(z.string())).nullable().optional(),
  })
  .meta({ id: 'LayoutZoneState', title: 'LayoutZoneState' });

export type LayoutZoneState = z.infer<typeof LayoutZoneStateSchema>;
