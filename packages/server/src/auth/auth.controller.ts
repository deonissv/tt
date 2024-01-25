import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { SignInDto } from '@shared/dto/auth/sign-in.dto';
import { CreateUserDto } from '@shared/dto/users/create-user.dto';
import { AccessTokenDto } from '@shared/dto/auth/access-token';

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
