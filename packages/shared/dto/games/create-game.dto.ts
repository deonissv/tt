import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  bannerUrl: string;
}
