import axios from 'axios';
import { LOADER_URL } from '../config';
import { getAccessToken, resetAccessToken, saveAccessToken } from '../utils';

import type { AccessTokenDto, JWT, SignInDto } from '@shared/dto/auth';
import type { CreateUserDto, UpdateUserDto } from '@shared/dto/users';

export const AuthService = {
  async signin(payload: SignInDto): Promise<AccessTokenDto> {
    const response = await axios.post(LOADER_URL + 'auth/signin', payload);
    const token = response.data as AccessTokenDto;
    saveAccessToken(token);
    return token;
  },

  async signup(payload: CreateUserDto): Promise<AccessTokenDto> {
    const response = await axios.post(LOADER_URL + 'auth/signup', payload);
    const token = response.data as AccessTokenDto;
    saveAccessToken(token);
    return token;
  },

  async updateUser(code: string, updateUser: UpdateUserDto): Promise<AccessTokenDto> {
    const response = await axios.put(LOADER_URL + `users/${code}`, updateUser, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    const accessToken = response.data as AccessTokenDto;
    saveAccessToken(accessToken);
    return accessToken;
  },

  logout(): void {
    resetAccessToken();
  },

  getJWT() {
    const token = getAccessToken();
    if (!token) {
      return null;
    }
    return this.decode(token);
  },

  isAdmin(): boolean {
    const user = this.getJWT();
    return user?.role === 1;
  },

  authorized(): JWT | null {
    const decodedUser = this.getJWT();
    if (!decodedUser || decodedUser.exp * 1000 < Date.now()) {
      return null;
    }
    return decodedUser;
  },

  decode(token: string): JWT | null {
    try {
      return JSON.parse(window.atob(token.split('.')[1])) as JWT;
    } catch {
      return null;
    }
  },
};
