import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsAdapter } from '@nestjs/platform-ws';
import { initHavok } from '@shared/initHavok';
import { Logger as PGLogger } from '@shared/playground';
import { AppModule } from './app.module';
import { mainConfig } from './main.config';

declare const module: any;

async function bootstrap() {
  await initHavok();
  PGLogger.register(new Logger('Playground'));

  const app = await NestFactory.create(AppModule, {
    logger: [
      'fatal',
      'error',
      'warn',
      'log',
      'debug',
      // 'debug',
      'verbose',
    ],
  });
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (module.hot) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    module.hot.accept();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    module.hot.dispose(() => app.close());
  }
}
void bootstrap();
