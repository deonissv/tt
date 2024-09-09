import axios from 'axios';
import { LOADER_URL } from '../config';
import { getAccessToken } from '../utils';

import type { CreateGameDto, GameDto, GamePreviewDto, UpdateGameDto } from '@shared/dto/games';

export type { CreateGameDto, GameDto, GamePreviewDto, UpdateGameDto };

export const GameService = {
  async getGamePreviews(): Promise<GamePreviewDto[]> {
    const response = await axios.get(LOADER_URL + 'games', {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GamePreviewDto[];
  },

  async getUserGamePreviews(code: string): Promise<GamePreviewDto[]> {
    const response = await axios.get(LOADER_URL + `games/user/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GamePreviewDto[];
  },

  async createGame(createGameDto: CreateGameDto): Promise<GamePreviewDto> {
    const response = await axios.post(LOADER_URL + 'games', createGameDto, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GamePreviewDto;
  },

  async removeGame(code: string): Promise<string> {
    const response = await axios.delete(LOADER_URL + `games/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as string;
  },

  async getGame(code: string): Promise<GameDto> {
    const response = await axios.get(LOADER_URL + `games/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GameDto;
  },

  async modifyGame(code: string, updateGame: UpdateGameDto): Promise<GameDto> {
    const response = await axios.put(LOADER_URL + `games/${code}`, updateGame, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GameDto;
  },
};
