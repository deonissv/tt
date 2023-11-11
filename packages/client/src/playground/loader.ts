import { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import { fileToUrl } from '../utils';
import { modelLoaderService } from '../services/modelLoader.service';
import { Model } from '@shared/index';

export class Loader {
  static async loadModel(model: Model, scene: Scene): Promise<[Mesh, Mesh]> {
    const loadedModelMeshes = await modelLoaderService.load(model.meshURL);
    const container = await SceneLoader.LoadAssetContainerAsync('', loadedModelMeshes, scene);

    const colliderMeshes = model.colliderURL
      ? (await SceneLoader.LoadAssetContainerAsync('', await modelLoaderService.load(model.colliderURL), scene)).meshes
      : container.meshes;

    const material = new StandardMaterial('_material', scene);
    const loadedMaterial = await Loader._loadModelMaterial(model, scene);
    container.meshes[0].material = material;
    container.meshes[container.meshes.length - 1].material = loadedMaterial;

    const modelMesh = Mesh.MergeMeshes(container.meshes as Mesh[], false, true, undefined, true, true)!;
    const colliderMesh: Mesh = Mesh.MergeMeshes(colliderMeshes as Mesh[], false, true)!;

    return [modelMesh, colliderMesh];
  }

  static async _loadModelMaterial(model: Model, scene: Scene, name = ''): Promise<StandardMaterial> {
    const material = new StandardMaterial(name, scene);
    // @TODO test maps
    material.diffuseTexture = model.diffuseURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.diffuseURL)), scene)
      : null;
    material.ambientTexture = model.ambientURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.ambientURL)), scene)
      : null;
    material.specularTexture = model.specularURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.specularURL)), scene)
      : null;
    material.emissiveTexture = model.emissiveURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.emissiveURL)), scene)
      : null;
    material.reflectionTexture = model.reflectionURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.reflectionURL)), scene)
      : null;
    material.bumpTexture = model.normalURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.normalURL)), scene)
      : null;
    material.opacityTexture = model.opacityURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.opacityURL)), scene)
      : null;
    material.lightmapTexture = model.lightmapURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.lightmapURL)), scene)
      : null;

    return material;
  }
}
