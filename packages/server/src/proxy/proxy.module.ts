import { Module } from '@nestjs/common';
import { RoomsModule } from '../rooms/rooms.module';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  imports: [RoomsModule],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
