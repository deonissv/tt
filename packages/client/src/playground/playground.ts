import { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine';
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate';
import { PhysicsShapeType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';

// Side efects
import '@babylonjs/core/Culling/ray';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/loaders/OBJ/objFileLoader';
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Physics/physicsEngineComponent';

// WebGPU Extensions
import '@babylonjs/core/Engines/WebGPU/Extensions/engine.alpha';
import '@babylonjs/core/Engines/WebGPU/Extensions/engine.renderTarget';
import '@babylonjs/core/Engines/WebGPU/Extensions/engine.uniformBuffer';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.computeShader';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.cubeTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.debugging';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.dynamicBuffer';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.dynamicTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.externalTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.multiRender';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.query';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.rawTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.readTexture';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.renderTargetCube';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.textureSampler';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.storageBuffer';
// import '@babylonjs/core/Engines/WebGPU/Extensions/engine.videoTexture';

// @ts-ignore
// import { Inspector } from '@babylonjs/inspector';

import { PlaygroundScene } from './playgroundScene';

import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';

import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Actor } from './actor';
import { Loader } from './loader';
import { Model, FLIP_BIND_KEYS, ROTATE_CCW_KEYS, ROTATE_CW_KEYS, SCALE_DOWN_KEYS, SCALE_UP_KEYS } from '@shared/index';

export default class Playground {
  private _scene: Scene;
  private _hll: HighlightLayer;
  private _hoveredMesh: Mesh | null = null;
  private _pickedActor: Actor | null = null;
  private _cursorPos: [number, number] = [0, 0];

  private constructor(scene: Scene) {
    this._scene = scene;
    this._hll = new HighlightLayer('hll', this._scene); // @TODO change glow to thin solid line
  }

  private get _camera(): ArcRotateCamera {
    return this._scene.activeCamera as ArcRotateCamera;
  }

  private _pickMesh(): Mesh | null {
    return this._scene.pick(this._scene.pointerX, this._scene.pointerY).pickedMesh as Mesh | null;
  }

  private _pickActor(): Actor | null {
    const mesh = this._pickMesh();
    if (!mesh) return null;
    return mesh.parent! as Actor;
  }

  static async init(canvas: HTMLCanvasElement): Promise<Playground> {
    const engine = await this.initEngine(canvas);
    const scene = await PlaygroundScene.init(engine);

    const ground = CreateGround('___ground', { width: 10, height: 10 }, scene);
    ground.isPickable = false;
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

    engine.runRenderLoop(() => {
      scene.render();
    });
    window.addEventListener('resize', () => {
      engine.resize();
    });
    const pg = new Playground(scene);
    pg._handleHoverHighlight();
    pg._handlePick();
    pg._bindAction(FLIP_BIND_KEYS, Actor.prototype.flip);
    pg._bindAction(ROTATE_CW_KEYS, Actor.prototype.rotateCW);
    pg._bindAction(ROTATE_CCW_KEYS, Actor.prototype.rotateCCW);
    pg._bindAction(SCALE_UP_KEYS, Actor.prototype.scaleUp);
    pg._bindAction(SCALE_DOWN_KEYS, Actor.prototype.scaleDown);
    return pg;
  }

  private static async initEngine(canvas: HTMLCanvasElement): Promise<Engine> {
    let engine: Engine;
    const engineOptions = {
      stencil: true,
    };
    const webgpuSupported = await WebGPUEngine.IsSupportedAsync;
    if (webgpuSupported) {
      engine = new WebGPUEngine(canvas, engineOptions);
      await (engine as WebGPUEngine).initAsync();
    } else {
      engine = new Engine(canvas, true, engineOptions, true);
    }
    return engine;
  }

  private _handleHoverHighlight() {
    this._scene.onPointerObservable.add(evt => {
      if (evt.type !== PointerEventTypes.POINTERMOVE) return;
      const pickedMesh = this._pickMesh();
      if (!pickedMesh) {
        if (this._hoveredMesh) {
          this._hll.removeMesh(this._hoveredMesh);
          this._hoveredMesh = null;
        }
        return;
      }

      if (pickedMesh == this._hoveredMesh) return;
      if (this._hoveredMesh) this._hll.removeMesh(this._hoveredMesh);
      if (pickedMesh) this._hll.addMesh(pickedMesh, Color3.White());
      this._hoveredMesh = pickedMesh;
    });
  }

  private _handlePick() {
    this._scene.onPointerObservable.add(async evt => {
      switch (evt.type) {
        case PointerEventTypes.POINTERDOWN: {
          this._cursorPos = [this._scene.pointerX, this._scene.pointerY];
          this._pickedActor = this._pickActor();
          if (!this._pickedActor) return;
          this._pickedActor.pick();
          break;
        }
        case PointerEventTypes.POINTERUP: {
          if (!this._pickedActor) return;
          this._pickedActor.release();
          this._pickedActor = null;
          break;
        }
        case PointerEventTypes.POINTERMOVE: {
          if (!this._pickedActor) return;
          const prevCursorPos = this._cursorPos;
          this._cursorPos = [this._scene.pointerX, this._scene.pointerY];

          const cursorDX = this._cursorPos[0] - prevCursorPos[0];
          const cursorDY = this._cursorPos[1] - prevCursorPos[1];
          const dx = Math.cos(this._camera.alpha) * cursorDY + Math.sin(this._camera.alpha) * cursorDX;
          const dy = -Math.cos(this._camera.alpha) * cursorDX + Math.sin(this._camera.alpha) * cursorDY;

          this._pickedActor.move(dx, dy);
        }
      }
    });
  }

  private _bindAction(key: string[], action: () => void) {
    this._scene.onKeyboardObservable.add(kbInfo => {
      const evt = kbInfo.event;
      if (!key.includes(evt.code)) return;
      if (kbInfo.type === 1) {
        const target = this._pickedActor || (this._hoveredMesh!.parent as Actor);
        if (!target) return;
        action.apply(target);
      }
    });
  }

  async test() {
    const boxModel = CreateBox('___sphere', { width: 1, height: 1, depth: 1 }, this._scene);
    new Actor('box', boxModel, undefined, this._scene, undefined, new Vector3(-3, 0, 0));
    // Inspector.Show(this._scene, {});
  }

  async loadModel(model: Model, name = '') {
    await Loader.loadModel(model, this._scene, name);
  }
}
