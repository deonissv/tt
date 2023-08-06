import { JointState } from './JointState';

export interface JointHingeState extends JointState {
  //http://docs.unity3d.com/ScriptReference/HingeJoint.html
  UseLimits: boolean;
  Limits: JointLimits; //Limit of angular rotation on the hinge joint. http://docs.unity3d.com/ScriptReference/JointLimits.html
  UseMotor: boolean;
  Motor: JointMotor; //The motor will apply a force up to a maximum force to achieve the target velocity in degrees per second. http://docs.unity3d.com/ScriptReference/JointMotor.html
  UseSpring: boolean;
  Spring: JointSpring; //The spring attempts to reach a target angle by adding spring and damping forces. http://docs.unity3d.com/ScriptReference/JointSpring.html
}

export interface JointLimits {
  bounceMinVelocity: number;
  bounciness: number;
  contactDistance: number;
  max: number;
  min: number;
}

export interface JointMotor {
  force: number;
  freeSpin: number;
  targetVelocity: number;
}

export interface JointSpring {
  damper: number;
  spring: number;
  targetPosition: number;
}
