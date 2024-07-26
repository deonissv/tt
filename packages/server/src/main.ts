import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsAdapter } from '@nestjs/platform-ws';
import { Logger as PGLogger } from '@shared/playground';
import { AppModule } from './app.module';
import { mainConfig } from './main.config';
import { initHavok } from './utils';

async function bootstrap() {
  await initHavok();
  PGLogger.register(new Logger('Playground'));

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
      'JWT', // This name here is important for matching up with @ApiBearerAuth() in controller
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
