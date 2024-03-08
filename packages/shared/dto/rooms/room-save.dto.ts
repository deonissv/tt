import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RoomPreviewDto {
  @ApiProperty()
  @IsString()
  saveName: string;

  @ApiProperty()
  @IsString()
  saveCode: string;
}
