import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RoomwDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNumber()
  roomId: number;

  @ApiProperty()
  @IsNumber()
  type: number;

  @ApiProperty()
  @IsNumber()
  authorId: number;

  @ApiProperty()
  @IsNumber()
  savingDelay: number;

  @ApiProperty()
  @IsNumber()
  stateTickDelay: number;
}
