import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RoomPreviewDto {
  @ApiProperty()
  @IsString()
  roomCode: string;

  @ApiProperty()
  @IsString()
  gameCode: string;

  @ApiProperty()
  @IsString()
  gameName: string;

  @ApiProperty()
  @IsString()
  gameBannerUrl: string;
}
