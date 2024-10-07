import type { ParseInt, Tuple } from '@tt/utils';
import type { ActorBaseState } from '../ActorBaseState';
import type { DieActorType } from '../ActorType';
import type { ActorType } from '../ActorType';

export type DieType = 4 | 6 | 8 | 10 | 12 | 20;

export type DieTypeMapper<T extends DieType> = T extends `DIE${infer N}`
  ? N extends `${DieType}`
    ? ParseInt<N>
    : N extends '6ROUND'
      ? 6
      : never
  : never;

export interface RotationValue {
  value: number;
  rotation: Tuple<number, 3>;
}

export interface DieBaseState extends ActorBaseState {
  type: DieActorType;
  rotationValues: RotationValue[];
}
export interface DieNState<N extends DieType> extends DieBaseState {
  rotationValues: Tuple<RotationValue, N>;
}

export interface Die4State extends DieNState<4> {
  type: ActorType.DIE4;
}

export interface Die6State extends DieNState<6> {
  type: ActorType.DIE6;
}

export interface Die6RoundState extends DieNState<6> {
  type: ActorType.DIE6ROUND;
}

export interface Die8State extends DieNState<8> {
  type: ActorType.DIE8;
}

export interface Die10State extends DieNState<10> {
  type: ActorType.DIE10;
}

export interface Die12State extends DieNState<12> {
  type: ActorType.DIE12;
}

export interface Die20State extends DieNState<20> {
  type: ActorType.DIE20;
}

export type DieState = Die4State | Die6State | Die6RoundState | Die8State | Die10State | Die12State | Die20State;
