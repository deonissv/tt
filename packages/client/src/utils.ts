import type { AccessTokenDto } from '@shared/dto/auth';
import { hasProperty, isObject } from '@shared/guards';
import { AxiosError } from 'axios';

export const fileToUrl = (file: File, type = 'application/octet-stream'): string => {
  const textureBlob = new Blob([file], { type });
  return URL.createObjectURL(textureBlob);
};

export const saveAccessToken = (tokenDto: AccessTokenDto): void => {
  window.localStorage.setItem('access_token', tokenDto.access_token);
};

export const getAccessToken = (): string | null => {
  return window.localStorage.getItem('access_token');
};

export const resetAccessToken = (): void => {
  window.localStorage.removeItem('access_token');
};

export const getErrorMsg = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as unknown;
    if (isObject(responseData) && hasProperty(responseData, 'message')) return responseData.message as string;
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }
  if (isObject(error)) {
    if (hasProperty(error, 'message')) return JSON.stringify(error.message);
    if (hasProperty(error, 'error')) return JSON.stringify(error.error);
    if (hasProperty(error, 'name')) return JSON.stringify(error.name);
  }
  return JSON.stringify(error);
};
