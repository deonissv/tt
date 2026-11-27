/**
 * Tabletop Simulator marks never-depleting containers by their internal name:
 * drawing hands out a copy while the stored template stays in the bag.
 */
export function isInfiniteBagName(name: string): boolean {
  const lowered = name.toLowerCase();
  return lowered.startsWith('infinite_') || lowered === 'custom_model_infinite_bag';
}
