import { Injectable, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import path from 'node:path';

const PROXY_FOLDER = path.resolve(__dirname, '..', 'proxy');

@Injectable()
export class ProxyService {
  static logger = new Logger('ProxyService');

  ensureFolderExists = async (path: string) => {
    try {
      await fs.access(path);
      return true;
    } catch {
      await fs.mkdir(path);
      return true;
    }
  };

  writeToFile = async (roomCode: string, url: string, buffer: Buffer) => {
    const filename = encodeURIComponent(url);
    ProxyService.logger.log(`Transformed URL: ${filename}`);

    const fileFolder = path.resolve(PROXY_FOLDER, roomCode);
    await this.ensureFolderExists(fileFolder);
    await fs.appendFile(path.resolve(fileFolder, filename), buffer);

    ProxyService.logger.log(`Successfully saved file: ${filename}`);
  };

  async proxy(roomCode: string, url: string) {
    try {
      const response = await fetch(url);
      const file = await response.arrayBuffer();

      const buffer = Buffer.from(file);
      try {
        await this.writeToFile(roomCode, url, buffer);
      } catch (error) {
        ProxyService.logger.error(`Error saving file: ${JSON.stringify(error)}`);
      }

      return new StreamableFile(buffer);
    } catch (error) {
      ProxyService.logger.error(`Error proxying request: ${JSON.stringify(error)}`);
      throw new NotFoundException();
    }
  }
}
