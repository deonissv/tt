import * as fs from 'fs';
import * as path from 'path';

import * as HavokPhysics from '@babylonjs/havok';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function initHavok() {
  const wasm = path.join(__dirname, '../../HavokPhysics.wasm');
  const wasmBinary = fs.readFileSync(wasm);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  global.havok = await (HavokPhysics as any)({ wasmBinary });
}

async function bootstrap() {
  await initHavok();

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
void bootstrap();
