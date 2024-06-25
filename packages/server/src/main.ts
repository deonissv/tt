import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { mainConfig } from './main.config';
import { WsAdapter } from '@nestjs/platform-ws';
import { initHavok } from './utils';

async function bootstrap() {
  await initHavok();

  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));

  mainConfig(app);

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

  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<string>('PORT'));
}
void bootstrap();
