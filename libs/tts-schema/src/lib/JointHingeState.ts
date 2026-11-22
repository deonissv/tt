import { z } from 'zod';
import { JointStateSchema } from './JointState';

export const JointLimitsSchema = z
  .object({
    bounceMinVelocity: z.number(),
    bounciness: z.number(),
    contactDistance: z.number(),
    max: z.number(),
    min: z.number(),
  })
  .meta({ id: 'JointLimits', title: 'JointLimits' });

export type JointLimits = z.infer<typeof JointLimitsSchema>;

export const JointMotorSchema = z
  .object({
    force: z.number(),
    freeSpin: z.number(),
    targetVelocity: z.number(),
  })
  .meta({ id: 'JointMotor', title: 'JointMotor' });

export type JointMotor = z.infer<typeof JointMotorSchema>;

export const JointSpringSchema = z
  .object({
    damper: z.number(),
    spring: z.number(),
    targetPosition: z.number(),
  })
  .meta({ id: 'JointSpring', title: 'JointSpring' });

export type JointSpring = z.infer<typeof JointSpringSchema>;

export const JointHingeStateSchema = z
  .object({
    ...JointStateSchema.shape,
    //http://docs.unity3d.com/ScriptReference/HingeJoint.html
    UseLimits: z.boolean(),
    Limits: JointLimitsSchema, //Limit of angular rotation on the hinge joint. http://docs.unity3d.com/ScriptReference/JointLimits.html
    UseMotor: z.boolean(),
    Motor: JointMotorSchema, //The motor will apply a force up to a maximum force to achieve the target velocity in degrees per second. http://docs.unity3d.com/ScriptReference/JointMotor.html
    UseSpring: z.boolean(),
    Spring: JointSpringSchema, //The spring attempts to reach a target angle by adding spring and damping forces. http://docs.unity3d.com/ScriptReference/JointSpring.html
  })
  .meta({ id: 'JointHingeState', title: 'JointHingeState' });

export type JointHingeState = z.infer<typeof JointHingeStateSchema>;
