import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { OBJFileLoader } from 'babylonjs-loaders';

export default class Playground {
    private _scene: BABYLON.Scene;
    private _engine: BABYLON.Engine;
    private _canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
    }

    async init() {
        this._engine = await this.createEngine(this._canvas);
        this._scene = await this.createScene(this._engine, this._canvas);

        // Register a render loop to repeatedly render the scene
        this._engine.runRenderLoop(() => { this._scene.render() });

        // Watch for browser/canvas resize events
        window.addEventListener("resize", () => { this._engine.resize() });

    }


    async createEngine(canvas: HTMLCanvasElement): Promise<BABYLON.Engine> {
        let engine: BABYLON.Engine;
        const webgpuSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
        if (webgpuSupported) {
            engine = new BABYLON.WebGPUEngine(canvas, {
                deviceDescriptor: {
                    requiredFeatures: [
                        "depth-clip-control",
                        "depth32float-stencil8",
                        "texture-compression-bc",
                        "texture-compression-etc2",
                        "texture-compression-astc",
                        "timestamp-query",
                        "indirect-first-instance",
                    ],
                },
            });
            await (engine as BABYLON.WebGPUEngine).initAsync();
        } else {
            engine = new BABYLON.Engine(canvas, true);
        }
        return engine;
    }

    async createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): Promise<BABYLON.Scene> {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(engine);

        // This creates and positions a free camera (non-mesh)
        // const camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
        const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, options, scene
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;

        // const a = OBJFileLoader.loadAsync(this._scene, "MunchkinFig_v5.compcoll.obj", "http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.compcoll.obj");
        // const loader = new OBJFileLoader();
        const target_url = 'https://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.compcoll.obj';
        const url = 'https://cors-anywhere.herokuapp.com/' + target_url;
        // const objUrl = "http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.compcoll.obj";
        // const proxydUrl = 'https://corsproxy.io/?' + encodeURIComponent(objUrl);
        fetch(url).then((val) => {
            val.blob().then(blob => {
                console.log(blob);

                const file = new File([blob], "Stanford.obj");
                BABYLON.SceneLoader.ImportMesh("", "", file, scene, function (newMeshes) {
                    // Set the target of the camera to the first imported mesh
                    newMeshes[0].scaling.scaleInPlace(50);
                });
            });
        })



        // Our built-in 'ground' shape. Params: name, options, scene
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

        return scene;
    }
}