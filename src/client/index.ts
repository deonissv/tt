import Playground from './playground';

import './public/styles.css';
import { SaveState } from './models/tts-model/SaveState';
import { Model } from './models/SandBox';

const MESH_URL = 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.obj';
const TEXTURE_URL = 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.tex.png';
const COLLIDER_URL = 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.compcoll.obj';

const model: Model = {
  meshURL: MESH_URL,
  diffuseURL: TEXTURE_URL,
  colliderURL: COLLIDER_URL,
};

let pg: Playground;
export const babylonInit = async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const playground = await Playground.init(canvas);
  pg = playground;
  playground.loadModel(model);
};

babylonInit().then(() => {});

document.getElementById('game-cfg')!.addEventListener('change', (event: Event) => {
  const target = event.target! as HTMLInputElement;
  const file = target.files![0];
  const reader = new FileReader();
  console.log(1);

  reader.readAsText(file);
  reader.onload = async event => {
    let result = event.target!.result;
    if (result instanceof ArrayBuffer) {
      // TODO check when event.target.result returns ArrayBuffer
      const enc = new TextDecoder();
      result = enc.decode(result);
    }
    const content: SaveState = JSON.parse(result as string);
    console.log(content);

    const models = await parseTTSModes(content);
    models.forEach(model => {
      pg.loadModel(model);
    });
  };
});

const parseTTSModes = async (saveState: SaveState): Promise<Model[]> => {
  const models: Model[] = [];
  saveState.ObjectStates.forEach(objectState => {
    const url = objectState.CustomMesh?.MeshURL;
    if (url) {
      models.push({
        meshURL: url,
        diffuseURL: objectState.CustomMesh?.DiffuseURL,
        colliderURL: objectState.CustomMesh?.ColliderURL,
      });
    }
  });
  return models;
};
