import { z } from 'zod';

/** Generate JSON Schema with bigint IDs represented as JSON integers. */
export function toTtsJsonSchema(schema: z.ZodType) {
  return z.toJSONSchema(schema, {
    io: 'input',
    unrepresentable: ({ zodSchema }) => (zodSchema instanceof z.ZodBigInt ? { type: 'integer' } : 'throw'),
  });
}
