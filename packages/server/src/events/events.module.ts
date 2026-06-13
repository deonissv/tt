import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AuthModule } from '../auth/auth.module';
import { RoomsModule } from '../rooms/rooms.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [AuthModule, RoomsModule, TokenModule],
  providers: [EventsGateway],
})
export class EventsModule {}
