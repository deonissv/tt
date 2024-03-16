import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [AuthModule, RoomsModule],
  providers: [EventsGateway, JwtService],
})
export class EventsModule {}
