import { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

import { fileToUrl } from '../utils';
import { modelLoaderService } from '../services/model-loader.service';
import { Model } from '@shared/dto/pg/actorModel';
import { OBJFileLoader } from '@babylonjs/loaders';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Color3 } from '@babylonjs/core/Maths/math.color';

OBJFileLoader.SKIP_MATERIALS = true;

export class Loader {
  private static MeshAssets = new Map<string, Promise<Mesh | null>>();
  private static TextureAssets = new Map<string, Promise<Texture | null>>();

  // static async loadModel(model: Model, scene: Scene): Promise<[Mesh, Mesh]> {
  //   const loadedModelMeshes = await modelLoaderService.load(model.meshURL);
  //   const modelContainer = await SceneLoader.LoadAssetContainerAsync('', loadedModelMeshes, scene);

  //   const colliderContainer = model.colliderURL
  //     ? await SceneLoader.LoadAssetContainerAsync('', await modelLoaderService.load(model.colliderURL), scene)
  //     : modelContainer;

  //   const material = new StandardMaterial('_material', scene);
  //   const loadedMaterial = await Loader.loadModelMaterial(model, scene);
  //   modelContainer.meshes[0].material = material;
  //   modelContainer.meshes[modelContainer.meshes.length - 1].material = loadedMaterial;

  //   const modelMeshes = Loader.filterEmptyMeshes(modelContainer.meshes);
  //   const modelMesh = Mesh.MergeMeshes(modelMeshes as Mesh[], false, true, undefined, true, true)!;
  //   modelMesh.material = loadedMaterial;

  //   const colliderMeshes = Loader.filterEmptyMeshes(colliderContainer.meshes);
  //   const colliderMesh: Mesh = Mesh.MergeMeshes(colliderMeshes as Mesh[], false, true)!;

  //   return [modelMesh, colliderMesh];
  // }

  static async loadModel(model: Model): Promise<[Mesh | null, Mesh | null]> {
    const modelMesh = await Loader.loadMesh(model.meshURL);

    const colliderMesh = model.colliderURL ? await Loader.loadMesh(model.colliderURL) : modelMesh;
    const loadedMaterial = await Loader.loadModelMaterial(model);

    if (modelMesh?.material) {
      modelMesh.material = loadedMaterial;
    }
    return [modelMesh, colliderMesh];
  }

  static async loadMesh(meshUrl: string): Promise<Mesh | null> {
    if (!Loader.MeshAssets.has(meshUrl)) {
      const meshPromise = async () => {
        const loadedMeshes = await modelLoaderService.load(meshUrl);
        const container = await SceneLoader.LoadAssetContainerAsync('', loadedMeshes);
        const nonEmptyMeshes = Loader.filterEmptyMeshes(container.meshes);
        const mesh = Mesh.MergeMeshes(nonEmptyMeshes as Mesh[], false, true, undefined, true, true);
        if (!mesh) {
          return null;
        }

        mesh.setEnabled(false);
        mesh.name = meshUrl;
        // container.removeAllFromScene();
        return mesh.clone();
      };
      Loader.MeshAssets.set(meshUrl, meshPromise());
    }
    const mesh = await Loader.MeshAssets.get(meshUrl)!;
    if (!mesh) {
      return null;
    }

    return mesh.clone(mesh.name, null, true, true);
  }

  static async loadModelMaterial(model: Omit<Model, 'meshURL'>, name = ''): Promise<StandardMaterial> {
    const material = new StandardMaterial(name);
    material.diffuseColor = new Color3(1, 1, 1);
    // @TODO test maps
    material.diffuseTexture = model.diffuseURL ? await Loader.loadTexture(model.diffuseURL) : null;
    material.ambientTexture = model.ambientURL ? await Loader.loadTexture(model.ambientURL) : null;
    material.specularTexture = model.specularURL ? await Loader.loadTexture(model.specularURL) : null;
    material.emissiveTexture = model.emissiveURL ? await Loader.loadTexture(model.emissiveURL) : null;
    material.reflectionTexture = model.reflectionURL ? await Loader.loadTexture(model.reflectionURL) : null;
    material.bumpTexture = model.normalURL ? await Loader.loadTexture(model.normalURL) : null;
    material.opacityTexture = model.opacityURL ? await Loader.loadTexture(model.opacityURL) : null;
    material.lightmapTexture = model.lightMapURL ? await Loader.loadTexture(model.lightMapURL) : null;

    return material;
  }

  static async loadTexture(textureUrl: string, scene?: Scene): Promise<Texture | null> {
    if (!Loader.TextureAssets.has(textureUrl)) {
      const texturePromise = async () => {
        const loadedTexture = await modelLoaderService.load(textureUrl);

        if (!loadedTexture.type.includes('image')) {
          return null;
        }
        const url = fileToUrl(loadedTexture);
        return new Texture(url, scene);
      };
      Loader.TextureAssets.set(textureUrl, texturePromise());
    }
    const metarial = await Loader.TextureAssets.get(textureUrl);
    if (!metarial) {
      return null;
    }

    metarial.name = textureUrl;
    return metarial;
  }

  private static filterEmptyMeshes(meshes: AbstractMesh[]): AbstractMesh[] {
    return meshes.filter(mesh => mesh.getTotalVertices() > 0);
  }
}
