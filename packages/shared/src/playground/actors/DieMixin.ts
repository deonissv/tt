import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { DieBaseState } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import type { SharedBase } from './SharedBase';

export const DieMixin = <T extends Constructor<SharedBase<DieBaseState>>>(Base: T) => {
  return class Die extends Base {
    getValue() {
      const currentRotation = this.rotation;
      return this.__state.rotationValues.reduce(
        (closest, { value, rotation }) => {
          const distance = Vector3.DistanceSquared(currentRotation, Vector3.FromArray(rotation));
          return distance < closest.distance ? { value, distance } : closest;
        },
        { value: null as number | null, distance: Infinity },
      ).value;
    }
  };
};
