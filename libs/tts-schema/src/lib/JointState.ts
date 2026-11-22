import { z } from 'zod';
import { Vector3Schema } from './Vector3';

/** The game writes non-finite floats as "Infinity", "-Infinity" and "NaN" strings. */
export const JsonFloatSchema = z
  .union([z.number(), z.literal('Infinity'), z.literal('-Infinity'), z.literal('NaN')])
  .meta({ id: 'JsonFloat', title: 'JsonFloat' });

export type JsonFloat = z.infer<typeof JsonFloatSchema>;

// http://docs.unity3d.com/ScriptReference/Joint.html
export const JointStateSchema = z
  .object({
    /** GUID of the object this joint is connected to. */
    ConnectedBodyGUID: z.string(),
    EnableCollision: z.boolean(),
    Axis: Vector3Schema,
    Anchor: Vector3Schema,
    ConnectedAnchor: Vector3Schema,
    BreakForce: JsonFloatSchema,
    /** The game DTO spells this "Torgue". */
    BreakTorgue: JsonFloatSchema,
  })
  .meta({ id: 'JointState', title: 'JointState' });

export type JointState = z.infer<typeof JointStateSchema>;
