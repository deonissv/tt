import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsJSON, IsNotEmpty } from 'class-validator';

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
  @IsNotEmpty()
  @IsString()
  bannerUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsJSON()
  content: string;
}
