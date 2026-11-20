import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { MimeType } from '@tt/mime-resolver';
import type { Loader } from '@tt/loader';

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
  fetchFile: () =>
    Promise.resolve({
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=',
      mime: MimeType.PNG,
    }),
  // _getB64URL: vi.fn(),
  // _getObjectURL: vi.fn(),
  // bufferToURL: vi.fn(),
};
