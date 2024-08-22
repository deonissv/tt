import type { Tuple } from '@babylonjs/core/types';
import type { ActorBaseState } from './ActorBaseState';
import { ActorType } from './ActorType';

export interface RotationValue {
  value: number;
  rotation: Tuple<number, 3>;
}

export interface DieBaseState extends ActorBaseState {
  rotationValues: RotationValue[];
}

export type DieType = 4 | 6 | 8 | 10 | 12 | 20;

export const DieMapper = {
  4: ActorType.DIE4,
  6: ActorType.DIE6,
  8: ActorType.DIE8,
  10: ActorType.DIE10,
  12: ActorType.DIE12,
  20: ActorType.DIE20,
} as const satisfies Record<DieType, ActorType>;

type DieMapperT = typeof DieMapper;
export const ActorMapper: Record<DieMapperT[keyof DieMapperT], keyof DieMapperT> = Object.entries(DieMapper).reduce(
  (acc, [key, value]) => {
    acc[value] = parseInt(key, 10) as keyof DieMapperT;
    return acc;
  },
  {} as Record<ActorType, DieType>,
);

export interface DieNState<N extends DieType> extends DieBaseState {
  type: DieMapperT[N];
  rotationValues: Tuple<RotationValue, N>;
}

export type DieState = DieType extends infer N ? (N extends DieType ? DieNState<N> : never) : never;

export type Die4State = DieNState<4>;
export type Die6State = DieNState<6>;
export type Die8State = DieNState<8>;
export type Die10State = DieNState<10>;
export type Die12State = DieNState<12>;
export type Die20State = DieNState<20>;
