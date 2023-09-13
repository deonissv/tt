import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './styles.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// import { SaveState } from './models/tts-model/SaveState';
// import { Model } from './models/SandBox';
// import axios from 'axios';
// import { Playground } from './playground';

// const MESH_URL = 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.obj';
// const TEXTURE_URL = 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.tex.png';
// const COLLIDER_URL = 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.compcoll.obj';

// const model: Model = {
//   meshURL: MESH_URL,
//   diffuseURL: TEXTURE_URL,
//   colliderURL: COLLIDER_URL,
// };

// let pg: Playground;
// export const babylonInit = async () => {
//   const canvas = document.getElementById('canvas') as HTMLCanvasElement;
//   const playground = await Playground.init(canvas);
//   pg = playground;
//   await playground.test();
//   await playground.loadModel(model);
// };

// babylonInit().then(() => {});

// document.getElementById('game-cfg')!.addEventListener('change', (event: Event) => {
//   const target = event.target! as HTMLInputElement;
//   const file = target.files![0];
//   const reader = new FileReader();

//   reader.readAsText(file);
//   reader.onload = async event => {
//     let result = event.target!.result;
//     if (result instanceof ArrayBuffer) {
//       // TODO check when event.target.result returns ArrayBuffer
//       const enc = new TextDecoder();
//       result = enc.decode(result);
//     }
//     const content: SaveState = JSON.parse(result as string);
//     const models = await parseTTSModes(content);
//     models.forEach(model => {
//       pg.loadModel(model);
//     });
//   };
// });

// const parseTTSModes = async (saveState: SaveState): Promise<Model[]> => {
//   const models: Model[] = [];
//   saveState.ObjectStates.forEach(objectState => {
//     const url = objectState.CustomMesh?.MeshURL;
//     if (url) {
//       models.push({
//         meshURL: url,
//         diffuseURL: objectState.CustomMesh?.DiffuseURL,
//         colliderURL: objectState.CustomMesh?.ColliderURL,
//       });
//     }
//   });
//   return models;
// };

// const btn = document.getElementById('play-button');
// btn!.addEventListener('click', async () => {
//   const inpt = document.getElementById('username-input') as HTMLInputElement;
//   const userInput = inpt.value;

//   const roomId = userInput ? userInput : await axios.get('http://localhost:3000/room').then(res => res.data);
//   console.log(roomId);

//   const val = Math.floor(Math.random() * 1000);

//   connectToServer(roomId).then((ws: WebSocket) => {
//     ws.send('1');
//     setInterval(() => {
//       if (ws.readyState !== ws.OPEN) return;
//       ws.send('' + val);
//     }, 1000);

//     ws.onmessage = event => {
//       console.log(event.data);
//     };
//   });
// });

// async function connectToServer(roomId: string) {
//   const ws = new WebSocket(`ws://localhost:8081/${roomId}`);
//   return new Promise((resolve: (ws: WebSocket) => void, reject) => {
//     const timer = setInterval(() => {
//       if (ws.readyState === ws.OPEN) {
//         clearInterval(timer);
//         resolve(ws);
//       }
//     }, 10);
//   });
// }

// const val = Math.floor(Math.random() * 1000);

// connectToServer().then((ws: WebSocket) => {
//   ws.send('1');
//   setInterval(() => {
//     if (ws.readyState !== ws.OPEN) return;
//     ws.send('' + val);
//   }, 1000);

//   ws.onmessage = event => {
//     console.log(event.data);
//   };
// });
