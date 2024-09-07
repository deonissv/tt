import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { DieState, RotationValue } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import type { SharedBase } from './SharedBase';

export const DieMixin = <T extends Constructor<SharedBase<DieState>>>(Base: T) => {
  return class Die extends Base {
    getValue() {
      const currentRotation = this.rotation;
      const rotValues = this.__state.rotationValues as RotationValue[];
      const rotationLengths = rotValues.map(({ value, rotation }) => {
        const length = Vector3.DistanceSquared(currentRotation, Vector3.FromArray(rotation));
        return {
          value,
          length,
        };
      });
      rotationLengths.sort((a, b) => a.length - b.length);
      return rotationLengths[0].value;
    }
  };
};
