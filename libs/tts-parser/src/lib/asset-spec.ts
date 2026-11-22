import { DTO_SCHEMAS, isUrlSchema } from '@tt/tts-schema';
import type { DtoName } from '@tt/tts-schema';
import type { z } from 'zod';

export type { DtoName };

/** Metadata for finding assets. Zod validates field types and constraints. */
export type Shape =
  { t: 'leaf' } | { t: 'array'; of: Shape } | { t: 'record'; of: Shape } | { t: 'dto'; name: DtoName };

export interface FieldSpec {
  shape: Shape;
  /** The asset collector reads a remote URL from this field. */
  url?: boolean;
}

type AnySchema = z.ZodType;
type Def = Record<string, unknown> & { type: string };
const defOf = (schema: AnySchema): Def => schema.def as Def;

const dtoNameBySchema = new Map<AnySchema, DtoName>();
for (const [name, schema] of Object.entries(DTO_SCHEMAS)) {
  dtoNameBySchema.set(schema, name as DtoName);
}

function unwrap(schema: AnySchema): AnySchema {
  let node = schema;
  while (defOf(node).type === 'optional' || defOf(node).type === 'nullable' || defOf(node).type === 'lazy') {
    const def = defOf(node);
    node = def.type === 'lazy' ? (def.getter as () => AnySchema)() : (def.innerType as AnySchema);
  }
  return node;
}

function toShape(schema: AnySchema): Shape {
  const node = unwrap(schema);
  const def = defOf(node);
  switch (def.type) {
    case 'object': {
      const name = dtoNameBySchema.get(node);
      if (!name) throw new Error('Nested save DTO must be registered in DTO_SCHEMAS');
      return { t: 'dto', name };
    }
    case 'array':
      return { t: 'array', of: toShape(def.element as AnySchema) };
    case 'record':
      return { t: 'record', of: toShape(def.valueType as AnySchema) };
    default:
      return { t: 'leaf' };
  }
}

function buildSpec(schema: AnySchema): Record<string, FieldSpec> {
  const object = unwrap(schema) as z.ZodObject;
  const shape = object.shape as Record<string, AnySchema>;
  return Object.fromEntries(
    Object.entries(shape).map(([field, schema]) => [
      field,
      {
        shape: toShape(schema),
        ...(isUrlSchema(unwrap(schema)) ? { url: true } : {}),
      },
    ]),
  );
}

export const ASSET_DTOS = Object.fromEntries(
  Object.entries(DTO_SCHEMAS).map(([name, schema]) => [name, buildSpec(schema)]),
) as Record<DtoName, Record<string, FieldSpec>>;
