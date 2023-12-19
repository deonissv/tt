import * as fs from 'fs';
import * as path from 'path';

import * as HavokPhysics from '@babylonjs/havok';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function initHavok() {
  const wasm = path.join(__dirname, '../../HavokPhysics.wasm');
  const wasmBinary = fs.readFileSync(wasm);

  global.havok = await (HavokPhysics as unknown as (object) => Promise<object>)({ wasmBinary });
}

async function bootstrap() {
  await initHavok();

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('TT API')
    .addTag('tt')
    .setVersion('0.0.1')
    .addBearerAuth(
      {
        type: 'http',
        // scheme: 'basic',
        // bearerFormat: 'JWT',
        // name: 'JWT',
        // description: 'Enter JWT token',
        in: 'header',
      },
      'JWT', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
}
void bootstrap();
