import { MASS_DEFAULT } from '@shared/constants';

import { Loader } from '../loader';
import { floatCompare } from '@shared/utils';
import { ActorState, ActorStateUpdate } from '@shared/dto/pg/actorState';
import { Scene } from '@babylonjs/core/scene';
import BaseActor from '@shared/playground/baseActor';

export default class Actor extends BaseActor {
  static async fromState(actorState: ActorState, scene?: Scene): Promise<Actor | null> {
    const model = await Loader.loadModel(actorState.model, scene);

    if (!model) {
      return null;
    }

    const actor = new Actor(actorState, model, model, scene);
    return actor;
  }

  toState() {
    return {
      guid: this.guid,
      name: this.name,
      model: this.__stateModel,
      transformation: this.transformation,
      mass: this.__mass,
    };
  }

  toStateUpdate(actorState?: ActorState): ActorStateUpdate | null {
    const currentState = this.toStateSave();

    if (!actorState) {
      return currentState;
    }

    const rv: ActorStateUpdate = {
      guid: this.guid,
    };

    if (actorState.name !== this.name) {
      rv.name = this.name;
    }

    if (!floatCompare(actorState.mass ?? MASS_DEFAULT, this.mass)) {
      rv.mass = this.__mass;
    }

    const stateTransformation = {
      scale: actorState.transformation?.scale ?? Actor.DEFAULT_SCALE,
      rotation: actorState.transformation?.rotation ?? Actor.DEFAULT_ROTATION,
      position: actorState.transformation?.position ?? Actor.DEFAULT_POSITION,
    };

    const updatePosition = stateTransformation.position.some(
      (v, i) => !floatCompare(v, currentState.transformation?.position?.[i] ?? 0),
    );

    const updateRotation = stateTransformation.rotation.some(
      (v, i) => !floatCompare(v, currentState.transformation?.rotation?.[i] ?? 0),
    );

    const updateScale = stateTransformation.scale.some(
      (v, i) => !floatCompare(v, currentState.transformation?.scale?.[i] ?? 1),
    );

    if (updatePosition || updateRotation || updateScale) {
      rv.transformation = {
        scale: updateScale ? stateTransformation.scale : undefined,
        rotation: updateRotation ? stateTransformation.rotation : undefined,
        position: updatePosition ? stateTransformation.position : undefined,
      };
    }

    if (Object.keys(rv).length === 1) {
      return null;
    }

    return rv;
  }

  toStateSave(): ActorState {
    return {
      guid: this.guid,
      name: this.name,
      model: this.__stateModel,
      transformation: this.transformation,
      mass: this.__mass,
    };
  }

  update(actorStateUpdate: ActorStateUpdate) {
    if (actorStateUpdate.transformation?.position) {
      const pos = actorStateUpdate.transformation.position as [number, number, number];
      this.move(...pos);
    }
  }

  static applyStateUpdate(actorState: ActorState, actorStateUpdate: ActorStateUpdate): ActorState {
    const mergedScale = actorStateUpdate.transformation?.scale ?? actorState.transformation?.scale;
    const mergedPosition = actorStateUpdate.transformation?.position ?? actorState.transformation?.position;
    const mergedRotation = actorStateUpdate.transformation?.rotation ?? actorState.transformation?.rotation;

    const rv: ActorState = {
      guid: actorStateUpdate.guid,
      model: actorStateUpdate.model ?? actorState.model,
      name: actorStateUpdate.name ?? actorState.name,
    };

    if (mergedScale !== undefined || mergedPosition !== undefined || mergedRotation !== undefined) {
      rv.transformation = {
        scale: mergedScale,
        rotation: mergedRotation,
        position: mergedPosition,
      };
    }

    return rv;
  }
}
