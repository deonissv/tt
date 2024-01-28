import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LOADER_URL } from '../config';
import { SignInDto } from '@shared/dto/auth/sign-in.dto';
import { CreateUserDto } from '@shared/dto/users/create-user.dto';
import { AccessTokenDto } from '@shared/dto/auth/access-token';
import { resetAccessToken } from '../utils';
import { JWT } from '@shared/dto/auth/jwt';

export const AuthService = {
  async signin(payload: SignInDto): Promise<AccessTokenDto> {
    const response = await axios.post(LOADER_URL + 'auth/signin', payload);
    return response.data as AccessTokenDto;
  },

  async signup(payload: CreateUserDto): Promise<AccessTokenDto> {
    const response = await axios.post(LOADER_URL + 'auth/signup', payload);
    return response.data as AccessTokenDto;
  },

  logout(): void {
    resetAccessToken();
  },

  authorized(): JWT | null {
    const token = document.cookie.split('=')[1];
    if (!token) {
      return null;
    }
    const decoded = jwtDecode<JWT>(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  },
};
