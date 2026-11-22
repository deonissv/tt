import { z } from 'zod';
import { urlString } from './url';

/**
 * `SaveState.MusicPlayer` stores background music menu settings.
 * Objects use `Mp3PlayerState` for their music players.
 */
export const AudioLibraryEntrySchema = z
  .object({
    Item1: z.string(), // Song title
    Item2: urlString(), // Song URL
  })
  .meta({ id: 'AudioLibraryEntry', title: 'AudioLibraryEntry' });

export type AudioLibraryEntry = z.infer<typeof AudioLibraryEntrySchema>;

export const MusicPlayerStateSchema = z
  .object({
    RepeatSong: z.boolean(),
    PlaylistEntry: z.number(),
    CurrentAudioTitle: z.string(),
    CurrentAudioURL: urlString(),
    AudioLibrary: z.array(AudioLibraryEntrySchema).optional(),
  })
  .meta({ id: 'MusicPlayerState', title: 'MusicPlayerState' });

export type MusicPlayerState = z.infer<typeof MusicPlayerStateSchema>;
