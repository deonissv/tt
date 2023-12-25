import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';
import { GamesModule } from './games/games.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [UsersModule, RoomsModule, AuthModule, GamesModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
