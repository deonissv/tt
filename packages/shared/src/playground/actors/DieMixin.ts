import { STATIC_HOST } from '@shared/constants';
import { ActorType, type DieNState, type DieType, type Model } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import { Loader } from '../Loader';
import type { SharedBase } from './SharedBase';

const DIE_TEXTURES = {
  normalURL: `${STATIC_HOST}/NEW-Dice_nrm strong.png`,
  specularURL: `${STATIC_HOST}/Dice_spec 1_gray.png`,
  diffuseURL: `${STATIC_HOST}/Dice_colored_diff 1.png`,
};
const DIE4_MODEL: Model = {
  meshURL: `${STATIC_HOST}/Tetrahedron.obj`,
  colliderURL: `${STATIC_HOST}/Tetrahedron_colision.obj`,
  ...DIE_TEXTURES,
};

const DIE6_MODEL: Model = {
  meshURL: `${STATIC_HOST}/Cube.obj`,
  colliderURL: `${STATIC_HOST}/Cube23284.obj`,
  ...DIE_TEXTURES,
};

const DIE8_MODEL: Model = {
  ...DIE_TEXTURES,
  meshURL: `${STATIC_HOST}/Octahedron.obj`,
  colliderURL: `${STATIC_HOST}/Octahedron_colision.obj`,
};

const DIE10_MODEL: Model = {
  ...DIE_TEXTURES,
  meshURL: `${STATIC_HOST}/Trapezohedron.obj`,
  colliderURL: `${STATIC_HOST}/Trapezohedron_colision.obj`,
};

const DIE12_MODEL: Model = {
  ...DIE_TEXTURES,
  meshURL: `${STATIC_HOST}/Dodecahedron.obj`,
  colliderURL: `${STATIC_HOST}/Dodecahedron_colision.obj`,
};

const DIE20_MODEL: Model = {
  ...DIE_TEXTURES,
  meshURL: `${STATIC_HOST}/Icosahedron.obj`,
  colliderURL: `${STATIC_HOST}/icosahedron23294.obj`,
};

type Die<N extends DieType> = SharedBase<DieNState<N>>;

export const DieMixin = <T extends Constructor<Die<N>>, N extends DieType>(Base: T) => {
  const getDieModel = (state: DieNState<N>) => {
    switch (state.type) {
      case ActorType.DIE4:
        return DIE4_MODEL;
      case ActorType.DIE6:
        return DIE6_MODEL;
      case ActorType.DIE8:
        return DIE8_MODEL;
      case ActorType.DIE10:
        return DIE10_MODEL;
      case ActorType.DIE12:
        return DIE12_MODEL;
      case ActorType.DIE20:
        return DIE20_MODEL;
      default:
        throw new Error('Unknown die');
    }
  };

  return class Die extends Base {
    static async fromState<T extends Die>(this: Constructor<T>, state: DieNState<N>): Promise<T | null> {
      const modelProps = getDieModel(state);
      const [model, collider] = await Loader.loadModel(modelProps);

      if (!model) {
        return null;
      }

      return new this(state, model, collider ?? undefined);
    }
  };
};
