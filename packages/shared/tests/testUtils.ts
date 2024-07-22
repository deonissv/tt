import * as fs from 'fs';
import * as path from 'path';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export async function initHavok() {
  const HavokPhysics = await import('@babylonjs/havok');
  const hp = (process.env.NODE_ENV === 'test' ? HavokPhysics.default : HavokPhysics) as unknown as (
    object,
  ) => Promise<object>;
  const wasm = path.join(path.resolve(), '../../static/HavokPhysics.wasm');
  const wasmBinary = fs.readFileSync(wasm);

  global.havok = await hp({ wasmBinary });
}
