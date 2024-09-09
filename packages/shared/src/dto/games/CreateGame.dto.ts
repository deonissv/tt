import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class CreateGameDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  bannerUrl?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsJSON()
  content: string;
}
