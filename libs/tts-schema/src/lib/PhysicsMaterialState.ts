import { z } from 'zod';

/** UnityEngine.PhysicMaterialCombine values defined by Unity. */
export enum PhysicMaterialCombine {
  Average,
  Minimum,
  Multiply,
  Maximum,
}

export const PhysicsMaterialStateSchema = z
  .object({
    StaticFriction: z.number(), //Friction at rest, usually 0 to 1. Higher values resist the start of movement.
    DynamicFriction: z.number(), //Friction while moving, usually 0 to 1. Higher values slow the object more.
    Bounciness: z.number(), //0 = no bounce, 1 = bounce without energy loss.
    FrictionCombine: z.nativeEnum(PhysicMaterialCombine), //How to combine friction for two colliding objects. 0 = Average, 1 = Minimum, 2 = Multiply, 3 = Maximum.
    BounceCombine: z.nativeEnum(PhysicMaterialCombine), //How to combine bounciness for two colliding objects. 0 = Average, 1 = Minimum, 2 = Multiply, 3 = Maximum.
  })
  .meta({ id: 'PhysicsMaterialState', title: 'PhysicsMaterialState' });

export type PhysicsMaterialState = z.infer<typeof PhysicsMaterialStateSchema>;
