import { z } from 'zod';

export enum Menus {
  GENRES,
}

export const Mp3PlayerStateSchema = z
  .object({
    songTitle: z.string(),
    genre: z.string(),
    volume: z.number(),
    isPlaying: z.boolean(),
    loopOne: z.boolean(),
    menuTitle: z.string(),
    menu: z.nativeEnum(Menus),
  })
  .meta({ id: 'Mp3PlayerState', title: 'Mp3PlayerState' });

export type Mp3PlayerState = z.infer<typeof Mp3PlayerStateSchema>;
