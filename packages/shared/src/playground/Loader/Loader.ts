import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

import { OBJFileLoader } from '@babylonjs/loaders';
import type { Material, Model } from '@shared/dto/states';
import { Logger } from '../Logger';
import MimeDetector from './MimeDetector';
import { MimeType } from './MimeTypes';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 500; // ms

OBJFileLoader.SKIP_MATERIALS = true;

interface FetchedFile {
  url: string;
  mime: MimeType;
}

class Loader {
  public Assets = new Map<string, Promise<FetchedFile | null>>();

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
      Logger.log(`Empty container: ${meshURL}`);
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
    // @TODO test maps
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

  async _fetchFile(url: string): Promise<ArrayBuffer | null> {
    let attempts = 0;
    for (attempts = 0; attempts < RETRY_ATTEMPTS; attempts++) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer) {
          return arrayBuffer;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } catch (e) {
        Logger.log(`Failed attempt to fetch: ${url}`);
      }
    }
    return null;
  }

  async fetchFile(url: string): Promise<FetchedFile | null> {
    if (!this.Assets.has(url)) {
      const promiseCb = async (): Promise<FetchedFile | null> => {
        const arrayBuffer = await this._fetchFile(url);
        if (!arrayBuffer) {
          Logger.error(`Empty arrayBuffer: ${url}`);
          return null;
        }

        const mime = MimeDetector.getMime(arrayBuffer) ?? MimeType.OBJ;
        const b64 = this._getB64URL(arrayBuffer);

        Logger.log(`Fetched file: ${url}`);
        return { url: b64, mime };
      };
      this.Assets.set(url, promiseCb());
    }
    return this.Assets.get(url)!;
  }

  _getB64URL(buffer: ArrayBuffer) {
    const b64 = btoa(
      Array.from(new Uint8Array(buffer))
        .map(b => String.fromCharCode(b))
        .join(''),
    );
    return `data:;base64,${b64}`;
  }

  _getObjectURL(buffer: ArrayBuffer, type?: string) {
    type = type ?? MimeDetector.getMime(buffer);
    const blob = new Blob([buffer], { type });
    return URL.createObjectURL(blob);
  }

  bufferToURL(buffer: ArrayBuffer, _url: string, _type?: string): string {
    // const resourceURL = this._getObjectURL(buffer, type); // @TODO switch to getObjectURL, possible solution - wrapper for xhr2 using fetch
    const resourceURL = this._getB64URL(buffer);
    // this.Resources.set(url, resourceURL);
    return resourceURL;
  }
}

export default new Loader();
