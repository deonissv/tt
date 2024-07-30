import HavokPhysics from '@babylonjs/havok';
import * as fs from 'fs';
import * as path from 'path';

export async function initHavok() {
  const wasmPathPrefix = process.env.NODE_ENV === 'test' ? '../../../' : '..';
  const wasm = path.join(__dirname, wasmPathPrefix, 'node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
  const wasmBinary = fs.readFileSync(wasm);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.havok = await HavokPhysics({ wasmBinary });
}
