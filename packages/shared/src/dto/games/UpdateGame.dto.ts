import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsJSON, IsOptional } from 'class-validator';

export class UpdateGameDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsJSON()
  content?: string;
}
