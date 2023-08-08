import HavokPlugin from '@babylonjs/havok';
import { HavokPlugin as HP } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';

import { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { PhysicsShapeMesh } from '@babylonjs/core/Physics/v2/physicsShape';
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
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
import { Inspector } from '@babylonjs/inspector';

import { fileToUrl } from './utils';
import { Model } from './models/SandBox';
import { modelLoaderService } from './services';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';

const CAMERA_DEFAULT_POSITION = new Vector3(2, 2, 2);

export default class Playground {
  private _scene: Scene;
  private _actionManager: ActionManager;
  private _hll: HighlightLayer;
  private _hoveredMesh: Mesh | null = null;

  constructor(scene: Scene) {
    this._scene = scene;
    this._actionManager = new ActionManager(this._scene);
    this._actionManager.isRecursive = true;
    this._hll = new HighlightLayer('hll', this._scene); // @TODO change glow to thin solid line
  }

  static async init(canvas: HTMLCanvasElement): Promise<Playground> {
    const engine = await this.initEngine(canvas);
    const scene = await this.initScene(canvas, engine);

    engine.runRenderLoop(() => {
      scene!.render();
    });
    window.addEventListener('resize', () => {
      engine!.resize();
    });
    const pg = new Playground(scene);
    pg._handleHoverHighlight();

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

  private static async initScene(canvas: HTMLCanvasElement, engine: Engine): Promise<Scene> {
    const scene = new Scene(engine);
    scene.useRightHandedSystem = true;
    const camera = new ArcRotateCamera('Camera', 0, 0, 5, CAMERA_DEFAULT_POSITION, scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const hk = new HP(true, await HavokPlugin());

    const gravity = new Vector3(0, -9.81, 0);
    scene.enablePhysics(gravity, hk);

    const ground = CreateGround('___ground', { width: 10, height: 10 }, scene);
    ground.position.y = -0.5;
    ground.isPickable = false;
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    // Inspector.Show(scene, {});
    return scene;
  }

  private _handleHoverHighlight() {
    this._scene.onPointerObservable.add(evt => {
      if (evt.type !== PointerEventTypes.POINTERMOVE) return;
      const pickedMesh = this._scene.pick(this._scene.pointerX, this._scene.pointerY).pickedMesh as Mesh | null;
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

  async test() {
    const sphere = CreateSphere('___sphere', { diameter: 1 }, this._scene);
    sphere.position.x = -3;
    sphere.position.y = 1;
    new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1 }, this._scene);
  }

  async loadModel(model: Model, name: string = '') {
    const modelMesh = await modelLoaderService.load(model.meshURL);
    const container = await SceneLoader.LoadAssetContainerAsync('', modelMesh, this._scene);

    const colliderMeshes = model.colliderURL
      ? (await SceneLoader.LoadAssetContainerAsync('', await modelLoaderService.load(model.colliderURL), this._scene))
          .meshes
      : container.meshes;

    const colliderMesh: Mesh = Mesh.MergeMeshes(colliderMeshes as Array<Mesh>, false, true)!;

    const m = new StandardMaterial('___material', this._scene);
    const material = await this._loadModelMaterial(model);
    container.meshes[0].material = m;
    container.meshes[container.meshes.length - 1].material = material;
    colliderMesh.isVisible = false;

    const node = new Mesh(name, this._scene);

    const nodeModel = Mesh.MergeMeshes(container.meshes as Array<Mesh>, false, true, undefined, true, true)!;
    nodeModel.name = `${name}_model`;
    nodeModel.setParent(node);

    const nodeCollider = new Mesh(`${name}_collider`, this._scene);
    nodeCollider.setParent(node);
    colliderMesh.setParent(nodeCollider);

    const collider = new PhysicsShapeMesh(colliderMesh, this._scene);
    new PhysicsAggregate(nodeModel, collider, { mass: 1 }, this._scene);
  }

  async _loadModelMaterial(model: Model, name = ''): Promise<StandardMaterial> {
    const material = new StandardMaterial(name, this._scene);
    // @TODO test maps
    material.diffuseTexture = model.diffuseURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.diffuseURL)), this._scene)
      : null;
    material.ambientTexture = model.ambientURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.ambientURL)), this._scene)
      : null;
    material.specularTexture = model.specularURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.specularURL)), this._scene)
      : null;
    material.emissiveTexture = model.emissiveURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.emissiveURL)), this._scene)
      : null;
    material.reflectionTexture = model.reflectionURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.reflectionURL)), this._scene)
      : null;
    material.bumpTexture = model.normalURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.normalURL)), this._scene)
      : null;
    material.opacityTexture = model.opacityURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.opacityURL)), this._scene)
      : null;
    material.lightmapTexture = model.lightmapURL
      ? new Texture(fileToUrl(await modelLoaderService.load(model.lightmapURL)), this._scene)
      : null;

    return material;
  }
}
