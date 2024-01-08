import { INestApplication, ValidationPipe } from '@nestjs/common';

export function mainConfig(app: INestApplication) {
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
}
