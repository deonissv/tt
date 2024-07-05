import * as fs from 'fs';
import * as path from 'path';

export async function initHavok() {
  const HavokPhysics = await import('@babylonjs/havok');
  const hp = (process.env.NODE_ENV === 'test' ? HavokPhysics.default : HavokPhysics) as unknown as (
    object,
  ) => Promise<object>;
  const wasm = path.join(path.resolve(), '/assets/HavokPhysics.wasm');
  const wasmBinary = fs.readFileSync(wasm);

  global.havok = await hp({ wasmBinary });
}
