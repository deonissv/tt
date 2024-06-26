import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';
import { OBJFileLoader } from '@babylonjs/loaders';
import { Logger } from '@nestjs/common';
import type { ActorModel } from '@shared/dto/simulation';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 500; // ms

type ModelExtentions = '.obj' | '.gltf' | '.glb';

interface FetchedModel {
  b64: string;
  text: string | null;
}

OBJFileLoader.SKIP_MATERIALS = true;

export class Loader {
  private static readonly logger = new Logger(Loader.name);

  static async loadModel(model: ActorModel, scene?: Scene): Promise<Mesh | null> {
    return await Loader.loadMesh(model.meshURL, scene);
  }

  static async loadMesh(modelURL: string, scene?: Scene): Promise<Mesh | null> {
    const beforeLoad = Date.now();
    const fetchedModel = await this.fetchFile(modelURL);

    try {
      if (!fetchedModel) {
        return null;
      }

      const onModelLoaded = Date.now();

      const modelExtention = Loader.getModelExtension(fetchedModel.text);
      if (!modelExtention) {
        Loader.logger.log(`loadModel ${modelURL} ${onModelLoaded - beforeLoad}ms | Can't determine model extention`);
        return null;
      }

      const container = await SceneLoader.LoadAssetContainerAsync('', fetchedModel.b64, scene, null, modelExtention);
      if (!container) {
        return null;
      }

      const onModelImported = Date.now();

      Loader.logger.log(
        `loadModel ${modelURL} ${onModelLoaded - beforeLoad}ms | import model ${
          onModelImported - onModelLoaded
        }ms | total ${onModelImported - beforeLoad}ms`,
      );

      const meshes = container.meshes.filter(mesh => mesh.getTotalVertices() > 0) as Mesh[];
      const modelMesh = Mesh.MergeMeshes(meshes, false, true, undefined, true, true)!;
      return modelMesh;
    } catch (e) {
      const err = e as Error;
      const errorName = fetchedModel?.b64 ? err.name.replace(fetchedModel?.b64, '{{ B64 }}') : err.name;
      const errorStack = fetchedModel?.b64 ? err.stack?.replace(fetchedModel?.b64, '{{ B64 }}') : err.stack;
      const errorMessage = fetchedModel?.b64 ? err.message.replace(fetchedModel?.b64, '{{ B64 }}') : err.message;
      Loader.logger.error(`LoadAssetContainerAsync ${modelURL} failed: ${errorName} | ${errorMessage} | ${errorStack}`);
      return null;
    }
  }

  static getModelExtension(model: string | null): ModelExtentions | null {
    if (!model) {
      return null;
    }
    if (model.toLowerCase().includes('html')) {
      return null;
    }
    return '.obj';
  }

  static async fetchFile(url: string): Promise<FetchedModel | null> {
    let attempts = 0;
    for (attempts = 0; attempts < RETRY_ATTEMPTS; attempts++) {
      const fetchedModel = await Loader._fetchFile(url);
      if (fetchedModel) {
        return fetchedModel;
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
    return null;
  }

  static async _fetchFile(url: string): Promise<FetchedModel | null> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.clone().arrayBuffer();
      const text = await response
        .clone()
        .text()
        .catch(() => null);

      const b64 = btoa(
        Array.from(new Uint8Array(arrayBuffer))
          .map(b => String.fromCharCode(b))
          .join(''),
      );
      return {
        b64: `data:;base64,${b64}`,
        text,
      };
    } catch (e) {
      Loader.logger.error(`Failed to fetch file ${url}: ${e}`);
      return null;
    }
  }
}
