import axios from 'axios';
import { LOADER_URL } from '../config';
import { getAccessToken, resetAccessToken } from '../utils';

import type { AccessTokenDto, JWT, SignInDto } from '@shared/dto/auth';
import type { CreateUserDto } from '@shared/dto/users';

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
    const token = getAccessToken();
    if (!token) {
      return null;
    }
    const decoded = this.decode(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  },

  decode(token: string): JWT | null {
    try {
      return JSON.parse(window.atob(token.split('.')[1])) as JWT;
    } catch {
      return null;
    }
  },
};
