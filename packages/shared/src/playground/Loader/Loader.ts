import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

import { OBJFileLoader } from '@babylonjs/loaders';
import { Logger } from '@tt/logger';
import { MimeType } from '@tt/mime-resolver';
import type { Material, Model } from '@tt/states';

OBJFileLoader.SKIP_MATERIALS = true;

interface FetchedFile {
  url: string;
  mime: MimeType;
}

export type FileFetcher = (url: string) => Promise<FetchedFile | null>;

class Loader {
  public Assets = new Map<string, Promise<FetchedFile | null>>();
  fetchFile: FileFetcher = (_url: string) => {
    throw new Error('FileFetcher should be registered');
  };

  registartFileFetcher(fetcher: FileFetcher) {
    this.fetchFile = fetcher;
  }

  _getModelExtension(mime: MimeType): string {
    // @TODO: add more extensions
    // type ModelExtentions = '.obj' | '.gltf' | '.glb';

    switch (mime) {
      case MimeType.OBJ:
      default:
        return '.obj';
    }
  }

  async loadModel(model: Model): Promise<[Mesh | null, Mesh | null]> {
    Logger.log(`Loading model`);
    const modelMesh = await this.loadMesh(model.meshURL);
    Logger.log(`Loading collider: ${model.colliderURL}`);
    const colliderMesh = model.colliderURL ? await this.loadMesh(model.colliderURL) : null;
    Logger.log(`Loading material: ${JSON.stringify(model)}`);
    const loadedMaterial = await this.loadModelMaterial(model);

    if (modelMesh?.material) {
      modelMesh.material = loadedMaterial;
    }
    return [modelMesh, colliderMesh];
  }

  async _loadMesh(meshURL: string): Promise<Mesh | null> {
    const fetchedFile = await this.fetchFile(meshURL);
    if (!fetchedFile) {
      Logger.error(`Empty fetch response: ${meshURL}`);
      return null;
    }

    if (fetchedFile.mime == MimeType.HTML) {
      Logger.error(`HTML mime type: ${meshURL}`);
      return null;
    }

    const extention = this._getModelExtension(fetchedFile.mime);
    Logger.log(`Extention found: ${meshURL} - ${extention}`);

    const container = await SceneLoader.LoadAssetContainerAsync(
      '',
      fetchedFile.url,
      undefined,
      undefined,
      extention,
    ).catch(e => {
      Logger.error(`Failed to load asset container: ${meshURL} - ${(e as Error).toString().slice(0, 100)}`);
      return null;
    });
    if (!container) {
      Logger.warn(`Empty container: ${meshURL}`);
      return null;
    }

    const nonEmptyMeshes = this.filterEmptyMeshes(container.meshes);
    const mesh = Mesh.MergeMeshes(nonEmptyMeshes as Mesh[], false, true, undefined, true, true);
    if (!mesh) {
      Logger.error(`Empty mesh: ${meshURL}`);

      return null;
    }

    mesh.setEnabled(false);
    mesh.name = meshURL;
    // container.removeAllFromScene();
    // return mesh.clone();
    return mesh;
  }

  async loadMesh(meshURL: string): Promise<Mesh | null> {
    Logger.log(`Loading mesh: ${meshURL}`);
    const mesh = await this._loadMesh(meshURL);

    if (!mesh) {
      Logger.error(`No mesh found: ${meshURL}`);

      return null;
    }

    const clonedMesh = mesh.clone(mesh.name, null, true, true);
    Logger.log(`Mesh loaded: ${meshURL}`);
    return clonedMesh;
  }

  async loadModelMaterial(modelMaterial: Material, name = ''): Promise<StandardMaterial> {
    Logger.log(`Loading material: ${JSON.stringify(modelMaterial)}`);

    const material = new StandardMaterial(name);
    material.diffuseColor = new Color3(1, 1, 1);
    material.diffuseTexture = modelMaterial.diffuseURL ? await this.loadTexture(modelMaterial.diffuseURL) : null;
    material.ambientTexture = modelMaterial.ambientURL ? await this.loadTexture(modelMaterial.ambientURL) : null;
    material.specularTexture = modelMaterial.specularURL ? await this.loadTexture(modelMaterial.specularURL) : null;
    material.emissiveTexture = modelMaterial.emissiveURL ? await this.loadTexture(modelMaterial.emissiveURL) : null;
    material.reflectionTexture = modelMaterial.reflectionURL
      ? await this.loadTexture(modelMaterial.reflectionURL)
      : null;
    material.bumpTexture = modelMaterial.normalURL ? await this.loadTexture(modelMaterial.normalURL) : null;
    material.opacityTexture = modelMaterial.opacityURL ? await this.loadTexture(modelMaterial.opacityURL) : null;
    material.lightmapTexture = modelMaterial.lightMapURL ? await this.loadTexture(modelMaterial.lightMapURL) : null;

    return material;
  }

  async _loadTexture(textureURL: string): Promise<Texture | null> {
    const fetchedFile = await this.fetchFile(textureURL);
    if (!fetchedFile) {
      return null;
    }
    return new Texture(fetchedFile.url);
  }

  async loadTexture(textureURL: string): Promise<Texture | null> {
    Logger.log(`Loading texture: ${textureURL}`);
    const metarial = await this._loadTexture(textureURL);
    if (!metarial) {
      return null;
    }

    metarial.name = textureURL;
    return metarial;
  }

  private filterEmptyMeshes(meshes: AbstractMesh[]): AbstractMesh[] {
    return meshes.filter(mesh => mesh.getTotalVertices() > 0);
  }
}

export default new Loader();
