import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { PrismaService } from '../prisma.service';
import { ConfigModule } from '@nestjs/config';
import { GamesModule } from '../games/games.module';
import { PermissionsService } from '../permissions.service';

@Module({
  imports: [ConfigModule, GamesModule],
  providers: [RoomsService, PrismaService, PermissionsService],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
