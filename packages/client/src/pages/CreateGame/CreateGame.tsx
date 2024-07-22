import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Input from '@components/Input';
import { GameService } from '@services/game.service';

import { TTSParser } from '@client/src/TTSParser';
import type { SimulationStateSave } from '@shared/dto/states';

export const CreateGame = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [content, setContent] = useState('');
  const [reqRes, setReqRes] = useState('');

  const onCreate = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (name === '' || description === '') {
      setReqRes('Please fill all fields');
      return;
    }

    await GameService.createGame({ name, description, bannerUrl, content });
    navigate('/');
  };

  const parseGameText = (text: string): SimulationStateSave => {
    const ttsGame = TTSParser.parse(text);
    if (ttsGame) {
      return ttsGame;
    }
    return JSON.parse(text) as SimulationStateSave; // @TODO add validation
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = result => {
      const text = result?.target?.result as string;
      setContent(JSON.stringify(parseGameText(text)));
    };
  };

  return (
    <div className="flex justify-center w-full mb-5">
      <div className="bg-light-blue p-11">
        <h4 className="text-center !text-2xl !font-bold mb-6">Add game</h4>
        <h4 className="text-center !text-2xl !font-bold mb-2 text-red-500">{reqRes}</h4>
        <div className="flex">
          <div className="p-3">
            <Input
              label="Name"
              placeholder="Name"
              required
              value={name}
              onChange={e => setName((e.target as HTMLInputElement).value)}
            />
            <Input
              label="Description"
              placeholder="Description"
              required
              value={description}
              onChange={e => setDescription((e.target as HTMLInputElement).value)}
            />
            <Input
              label="Banner"
              placeholder="Banner"
              required
              value={bannerUrl}
              onChange={e => setBannerUrl((e.target as HTMLInputElement).value)}
            />
            <input
              type="file"
              id="content"
              name="content"
              accept="application/JSON"
              onChange={e => {
                const file = e?.target.files?.[0];
                if (file) {
                  readFile(file);
                }
              }}
            />
            <button className="bg-blue rounded-full px-10 py-3 text-white" onClick={e => onCreate(e)}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
