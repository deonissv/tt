import type { CreateGameDto, GameDto, GamePreviewDto, UpdateGameDto } from '@tt/dto';
import axios from 'axios';
import { ENDPOINT } from '../config';
import { getAccessToken } from '../utils';

export type { CreateGameDto, GameDto, GamePreviewDto, UpdateGameDto };

export const GameService = {
  async getGamePreviews(): Promise<GamePreviewDto[]> {
    const response = await axios.get(ENDPOINT + 'games', {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GamePreviewDto[];
  },

  async getUserGamePreviews(code: string): Promise<GamePreviewDto[]> {
    const response = await axios.get(ENDPOINT + `games/user/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GamePreviewDto[];
  },

  async createGame(createGameDto: CreateGameDto): Promise<GamePreviewDto> {
    const response = await axios.post(ENDPOINT + 'games', createGameDto, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GamePreviewDto;
  },

  async deleteGame(code: string): Promise<string> {
    const response = await axios.delete(ENDPOINT + `games/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as string;
  },

  async getGame(code: string): Promise<GameDto> {
    const response = await axios.get(ENDPOINT + `games/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GameDto;
  },

  async modifyGame(code: string, updateGame: UpdateGameDto): Promise<GameDto> {
    const response = await axios.put(ENDPOINT + `games/${code}`, updateGame, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as GameDto;
  },
};
