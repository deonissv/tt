import axios from 'axios';
import { LOADER_URL } from '../config';
import { getAccessToken } from '../utils';
import { GamePreviewDto } from '@shared/dto/games/game-preview.dto';
import { CreateGameDto } from '@shared/dto/games/create-game.dto';

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
};
