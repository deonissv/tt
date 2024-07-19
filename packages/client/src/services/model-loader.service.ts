import { MimeDetector } from '@shared/playground/Loader';
import axios from 'axios';
import { LOADER_URL } from '../config';

export const modelLoaderService = {
  async load(url: string): Promise<File> {
    const response = await axios.get(LOADER_URL, {
      params: {
        url,
      },
      responseType: 'arraybuffer',
    });
    const blob = new Blob([response.data]);
    const file = new File([blob], 'Stanford.obj', { type: MimeDetector.getMime(response.data as ArrayBuffer) });
    return file;
  },
};
