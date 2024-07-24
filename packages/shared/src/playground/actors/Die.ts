import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { STATIC_HOST } from '@shared/constants';
import type { DieNState, DieType, Model } from '@shared/dto/states';
import { Loader } from '../Loader';
import { ActorBase } from './ActorBase';

const DIE_MASS = 2;

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

export class Die<N extends DieType> extends ActorBase {
  declare __state: DieNState<N>;

  constructor(state: DieNState<N>, model: Mesh, colliderMesh?: Mesh) {
    super(state.guid, state.name, model, colliderMesh, state.transformation, DIE_MASS, undefined, state);
  }
}

export class Die4 extends Die<4> {
  static override async fromState(state: DieNState<4>) {
    const [model, collider] = await Loader.loadModel(DIE4_MODEL);

    if (!model) {
      return null;
    }

    return new Die4(state, model, collider ?? undefined);
  }
}

export class Die6 extends Die<6> {
  static override async fromState(state: DieNState<6>) {
    const [model, collider] = await Loader.loadModel(DIE6_MODEL);

    if (!model) {
      return null;
    }

    return new Die6(state, model, collider ?? undefined);
  }
}

export class Die8 extends Die<8> {
  static override async fromState(state: DieNState<8>) {
    const [model, collider] = await Loader.loadModel(DIE8_MODEL);

    if (!model) {
      return null;
    }

    return new Die8(state, model, collider ?? undefined);
  }
}

export class Die10 extends Die<10> {
  static override async fromState(state: DieNState<10>) {
    const [model, collider] = await Loader.loadModel(DIE10_MODEL);

    if (!model) {
      return null;
    }

    return new Die10(state, model, collider ?? undefined);
  }
}

export class Die12 extends Die<12> {
  static override async fromState(state: DieNState<12>) {
    const [model, collider] = await Loader.loadModel(DIE12_MODEL);

    if (!model) {
      return null;
    }

    return new Die12(state, model, collider ?? undefined);
  }
}

export class Die20 extends Die<20> {
  static override async fromState(state: DieNState<20>) {
    const [model, collider] = await Loader.loadModel(DIE20_MODEL);

    if (!model) {
      return null;
    }

    return new Die20(state, model, collider ?? undefined);
  }
}
