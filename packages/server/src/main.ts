import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// import { CAMERA_DEFAULT_ALPHA } from '../../shared/constants';
// console.log(CAMERA_DEFAULT_ALPHA);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
