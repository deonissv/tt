import 'babylonjs-loaders';
import { Model } from '@shared/index';
import { Mesh, Scene, SceneLoader } from 'babylonjs';

export class Loader {
  static async loadModel(model: Model, scene: Scene): Promise<Mesh> {
    const modelURL = model.colliderURL ?? model.meshURL;
    const loadedModelMeshes = await this.fetchFile(modelURL);

    const container = await SceneLoader.LoadAssetContainerAsync('', loadedModelMeshes, scene, null, '.obj');

    const modelMesh = Mesh.MergeMeshes(container.meshes as Mesh[], false, true, undefined, true, true)!;
    return modelMesh;
  }

  static async fetchFile(url: string): Promise<string> {
    // @todo find out file extention
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const b64 = btoa(
      Array.from(new Uint8Array(arrayBuffer))
        .map(b => String.fromCharCode(b))
        .join(''),
    );
    return `data:;base64,${b64}`;
  }
}
