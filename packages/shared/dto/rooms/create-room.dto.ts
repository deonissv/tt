import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  gameCode?: string;
}
