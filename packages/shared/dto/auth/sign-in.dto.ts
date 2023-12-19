import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly password: string;
}
