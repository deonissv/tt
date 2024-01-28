import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RoomPreviewDto {
  @ApiProperty()
  @IsString()
  roomCode: string;
}
