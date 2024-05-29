import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Vector3 } from '@babylonjs/core/Maths/math';

import { Loader } from './loader';
import { ActorState } from '@shared/dto/pg/actorState';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import BaseActor from '../../../shared/playground/baseActor';

export default class Actor extends BaseActor {
  static async fromState(actorState: ActorState): Promise<Actor | null> {
    const modelMesh = await Actor.modelFromState(actorState);
    if (!modelMesh) {
      console.log('Failed to load model mesh');

      return null;
    }

    const colliderMesh = await Actor.colliderFromState(actorState);
    if (!colliderMesh) {
      return null;
    }

    const actor = new Actor(actorState, modelMesh, colliderMesh);
    return actor;
  }

  static async modelFromState(actorState: ActorState): Promise<Mesh | null> {
    const [modelMesh, _colliderMesh] = await Loader.loadModel(actorState.model);

    if (!modelMesh) {
      return null;
    }

    if (actorState.transformation?.position) {
      modelMesh.position = new Vector3(...actorState.transformation.position);
    }

    if (actorState.transformation?.rotation) {
      modelMesh.rotation = new Vector3(...actorState.transformation.rotation);
    }

    if (actorState.transformation?.scale) {
      modelMesh.scaling = new Vector3(...actorState.transformation.scale);
    }

    if (modelMesh.material && actorState.colorDiffuse) {
      const stMaterial = modelMesh.material as StandardMaterial;
      stMaterial.diffuseColor = new Color3(...actorState.colorDiffuse.slice(0, 3));
      if (actorState.colorDiffuse.length > 3) {
        stMaterial.alpha = actorState.colorDiffuse[3];
      }
    }

    let childMeshes: Mesh[] = [];
    if (actorState?.children) {
      const loadedMeshes = await Promise.all(actorState.children.map(child => Actor.modelFromState(child)));
      childMeshes = loadedMeshes.filter(mesh => mesh !== null);
    }

    const mesh = Mesh.MergeMeshes([modelMesh, ...childMeshes], true, true, undefined, true, true)!;
    mesh.setEnabled(true);
    mesh.name = actorState.name;
    return mesh;
  }

  static async colliderFromState(actorState: ActorState): Promise<Mesh | null> {
    const [_modelMesh, colliderMesh] = await Loader.loadModel(actorState.model);

    if (!colliderMesh) {
      return null;
    }

    let childMeshes: Mesh[] = [];
    if (actorState?.children) {
      const loadedMeshes = await Promise.all(actorState.children.map(child => Actor.colliderFromState(child)));
      childMeshes = loadedMeshes.filter(mesh => mesh !== null);
    }

    const mesh = Mesh.MergeMeshes([colliderMesh, ...childMeshes], true, true, undefined, true, true)!;
    mesh.setEnabled(true);
    mesh.name = actorState.name;
    return mesh;
  }
  // static async modelFromState(actorState: ActorState, scene: Scene, parent?: Mesh): Promise<Mesh> {
  //   const [modelMesh, _colliderMesh] = await Loader.loadModel(actorState.model, scene);

  //   if (parent) {
  //     modelMesh.name = actorState.name;
  //     modelMesh.setParent(parent);
  //   } else {
  //     modelMesh.name = `model-${actorState.name}`;
  //   }

  //   if (actorState.children) {
  //     await Promise.all(actorState.children.map(child => Actor.modelFromState(child, scene, modelMesh)));
  //   }

  //   modelMesh.setEnabled(true);
  //   return modelMesh;
  // }

  //   static async colliderFromState(actorState: ActorState, scene: Scene, parent?: Mesh): Promise<Mesh> {
  //     const [_modelMesh, colliderMesh] = await Loader.loadModel(actorState.model, scene);

  //     if (parent) {
  //       colliderMesh.name = actorState.name;
  //       colliderMesh.setParent(parent);
  //     } else {
  //       colliderMesh.name = `collider-${actorState.name}`;
  //     }

  //     if (actorState.children) {
  //       await Promise.all(actorState.children.map(child => Actor.colliderFromState(child, scene, colliderMesh)));
  //     }

  //     return colliderMesh;
  //   }
}
