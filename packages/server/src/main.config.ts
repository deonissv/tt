import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

export function mainConfig(app: INestApplication) {
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
}
