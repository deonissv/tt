import axios from 'axios';
import { LOADER_URL } from '../config';
import { getFileMime } from '@shared/index';

export const modelLoaderService = {
  async load(url: string): Promise<File> {
    const response = await axios.get(LOADER_URL, {
      params: {
        url,
      },
      responseType: 'arraybuffer',
    });
    const blob = new Blob([response.data]);
    const file = new File([blob], 'Stanford.obj', { type: getFileMime(response.data) });
    return file;
  },
};
