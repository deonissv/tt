import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
