import { Controller, Get, Logger, NotFoundException, Param, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { isURL } from 'class-validator';
import * as fs from 'node:fs/promises';
import path from 'node:path';

@ApiTags('proxy')
@Controller('proxy')
export class ProxyController {
  static logger = new Logger('ProxyController');

  @Get('/*')
  async proxy(@Param() params: string[]) {
    ProxyController.logger.log('Received request for: ' + JSON.stringify(params));
    const url = params[0];
    ProxyController.logger.log('Received request for URL: ' + url);

    if (!isURL(url)) {
      ProxyController.logger.warn('Invalid URL: ' + url);
      throw new NotFoundException();
    }

    const filename = url.replaceAll('/', '|');
    ProxyController.logger.log('Transformed URL: ' + filename);

    try {
      const response = await fetch(url);
      const file = await response.arrayBuffer();

      const buffer = Buffer.from(file);
      await fs.appendFile(path.resolve(__dirname, '..', 'proxy', filename), buffer);

      ProxyController.logger.log('Successfully proxied request and saved file: ' + filename);
      return new StreamableFile(buffer);
    } catch (error) {
      ProxyController.logger.error('Error proxying request: ' + JSON.stringify(error));
      throw new NotFoundException();
    }
  }
}
