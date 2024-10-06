import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RoomSaveDto {
  @ApiProperty()
  @IsString()
  saveName: string;

  @ApiProperty()
  @IsString()
  saveCode: string;
}
