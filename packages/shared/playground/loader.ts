import { Model } from '@shared/dto/pg/actorModel';
import { OBJFileLoader } from '@babylonjs/loaders';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { StandardMaterial, Texture, AbstractMesh, Color3 } from '@babylonjs/core';
import { mimeResolver } from './mimeResolver';
import { MimeType } from './mimeTypes';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 500; // ms

OBJFileLoader.SKIP_MATERIALS = true;

class Loader {
  private MeshAssets = new Map<string, Promise<Mesh | null>>();
  private TextureAssets = new Map<string, Promise<Texture | null>>();
  public Resources = new Map<string, string>();

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
    const modelMesh = await this.loadMesh(model.meshURL);

    const colliderMesh = model.colliderURL ? await this.loadMesh(model.colliderURL) : modelMesh;
    const loadedMaterial = await this.loadModelMaterial(model);

    if (modelMesh?.material) {
      modelMesh.material = loadedMaterial;
    }
    return [modelMesh, colliderMesh];
  }

  async loadMesh(meshURL: string): Promise<Mesh | null> {
    if (!this.MeshAssets.has(meshURL)) {
      const meshPromise = async () => {
        const arrayBuffer = await this.fetchFile(meshURL);
        if (!arrayBuffer) {
          console.error(`Empty fetch response: ${meshURL}`);
          return null;
        }

        const mime = mimeResolver.getMime(arrayBuffer) ?? MimeType.OBJ;
        if (mime == MimeType.HTML) {
          console.error(`HTML mime type: ${meshURL}`);
          return null;
        }

        const resourceURL = this.bufferToURL(arrayBuffer, meshURL, mime);
        const container = await SceneLoader.LoadAssetContainerAsync(
          '',
          resourceURL,
          undefined,
          undefined,
          this._getModelExtension(mime),
        );
        const nonEmptyMeshes = this.filterEmptyMeshes(container.meshes);
        const mesh = Mesh.MergeMeshes(nonEmptyMeshes as Mesh[], false, true, undefined, true, true);
        if (!mesh) {
          console.error(`Empty mesh: ${meshURL}`);

          return null;
        }

        mesh.setEnabled(false);
        mesh.name = meshURL;
        // container.removeAllFromScene();
        return mesh.clone();
      };
      this.MeshAssets.set(meshURL, meshPromise());
    }
    const mesh = await this.MeshAssets.get(meshURL)!;
    if (!mesh) {
      console.error(`No mesh found: ${meshURL}`);

      return null;
    }

    return mesh.clone(mesh.name, null, true, true);
  }

  async loadModelMaterial(model: Omit<Model, 'meshURL'>, name = ''): Promise<StandardMaterial> {
    const material = new StandardMaterial(name);
    material.diffuseColor = new Color3(1, 1, 1);
    // @TODO test maps
    material.diffuseTexture = model.diffuseURL ? await this.loadTexture(model.diffuseURL) : null;
    material.ambientTexture = model.ambientURL ? await this.loadTexture(model.ambientURL) : null;
    material.specularTexture = model.specularURL ? await this.loadTexture(model.specularURL) : null;
    material.emissiveTexture = model.emissiveURL ? await this.loadTexture(model.emissiveURL) : null;
    material.reflectionTexture = model.reflectionURL ? await this.loadTexture(model.reflectionURL) : null;
    material.bumpTexture = model.normalURL ? await this.loadTexture(model.normalURL) : null;
    material.opacityTexture = model.opacityURL ? await this.loadTexture(model.opacityURL) : null;
    material.lightmapTexture = model.lightMapURL ? await this.loadTexture(model.lightMapURL) : null;

    return material;
  }

  async loadTexture(textureURL: string): Promise<Texture | null> {
    if (!this.TextureAssets.has(textureURL)) {
      const texturePromise = async () => {
        const arrayBuffer = await this.fetchFile(textureURL);
        if (!arrayBuffer) {
          return null;
        }
        const resourceURL = this.bufferToURL(arrayBuffer, textureURL);
        return new Texture(resourceURL);
      };
      this.TextureAssets.set(textureURL, texturePromise());
    }
    const metarial = await this.TextureAssets.get(textureURL);
    if (!metarial) {
      return null;
    }

    metarial.name = textureURL;
    return metarial;
  }

  private filterEmptyMeshes(meshes: AbstractMesh[]): AbstractMesh[] {
    return meshes.filter(mesh => mesh.getTotalVertices() > 0);
  }

  async fetchFile(url: string): Promise<ArrayBuffer | null> {
    let attempts = 0;
    for (attempts = 0; attempts < RETRY_ATTEMPTS; attempts++) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer) {
        return arrayBuffer;
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
    return null;
  }

  bufferToURL(buffer: ArrayBuffer, url: string, type?: string): string {
    type = type ?? mimeResolver.getMime(buffer);

    const blob = new Blob([buffer], { type });
    const resourceURL = URL.createObjectURL(blob);
    this.Resources.set(url, resourceURL);
    return resourceURL;
  }
}

export default new Loader();
