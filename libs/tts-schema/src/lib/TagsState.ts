import { z } from 'zod';

/**
 * Tag labels stored in `SaveState.ComponentTags`.
 * At runtime, `ComponentTags.tagsState` holds this state. Each object's `Tags` array
 * records which tags apply to it.
 */
export const TagLabelStateSchema = z
  .object({
    /** Label shown in the UI, e.g. "DELETED_ITEMS_IGNORE". */
    displayed: z.string(),
    /** Tag value, trimmed and converted to lowercase. */
    normalized: z.string(),
  })
  .meta({ id: 'TagLabelState', title: 'TagLabelState' });

export type TagLabelState = z.infer<typeof TagLabelStateSchema>;

export const TagsStateSchema = z
  .object({
    labels: z.array(TagLabelStateSchema).optional(),
  })
  .meta({ id: 'TagsState', title: 'TagsState' });

export type TagsState = z.infer<typeof TagsStateSchema>;
