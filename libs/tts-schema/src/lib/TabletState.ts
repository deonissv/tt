import { z } from 'zod';
import { urlString } from './url';

export const TabletStateSchema = z
  .object({
    PageURL: urlString(),
  })
  .meta({ id: 'TabletState', title: 'TabletState' });

export type TabletState = z.infer<typeof TabletStateSchema>;
