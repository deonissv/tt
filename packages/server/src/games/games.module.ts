import { Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [CaslModule],
  providers: [GamesService],
  exports: [GamesService],
  controllers: [GamesController],
})
export class GamesModule {}
