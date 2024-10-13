import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenDto, CreateUserDto, SignInDto } from '@tt/dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  login(@Body() signInDto: SignInDto): Promise<AccessTokenDto> {
    return this.authService.signin(signInDto);
  }

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto): Promise<AccessTokenDto> {
    return this.authService.signup(createUserDto);
  }
}
