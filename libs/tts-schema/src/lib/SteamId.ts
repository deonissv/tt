import { z } from 'zod';

/** Numeric save-file IDs use bigint when their digits exceed JavaScript's safe integer range. */
export const SteamIdSchema = z.union([z.number(), z.bigint()]);

export type SteamId = z.infer<typeof SteamIdSchema>;
