import { CreateBox, StandardMaterial, Texture } from '@babylonjs/core';
import type { Loader } from '@shared/playground';

export const LoaderMock: Partial<typeof Loader> = {
  loadMesh: () => Promise.resolve(CreateBox('testMesh', { size: 1 })),
  loadModel: () => Promise.resolve([CreateBox('testMesh', { size: 1 }), CreateBox('testMesh', { size: 1 })]),
  loadModelMaterial: () => Promise.resolve(new StandardMaterial('testMaterial')),
  loadTexture: () => Promise.resolve(new Texture('testTexture')),

  // _getModelExtension: vi.fn(),
  // _loadMesh: vi.fn(),
  // _loadTexture: vi.fn(),
  // filterEmptyMeshes: vi.fn(),
  // _fetchFile: vi.fn(),
  // fetchFile: vi.fn(),
  // _getB64URL: vi.fn(),
  // _getObjectURL: vi.fn(),
  // bufferToURL: vi.fn(),
};
