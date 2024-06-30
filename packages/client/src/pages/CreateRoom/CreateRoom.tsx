import { useEffect, useState } from 'react';

import { Input } from '@components/Input';
import { GameService } from '@services/game.service';
import type { GamePreviewDto } from '@shared/dto/games';
import GamesGallery from '../../components/GamesGallery';

const CreateRoom = () => {
  const [nickname, setNickname] = useState('');
  const [games, setGames] = useState<GamePreviewDto[]>([]);

  useEffect(() => {
    const loadPreviews = async () => {
      const gamePreviews = await GameService.getGamePreviews();
      setGames(games => {
        return [...games, ...gamePreviews];
      });
    };

    // eslint-disable-next-line no-console
    loadPreviews().catch(console.error);
  }, []);

  return (
    <div className="flex justify-center w-full">
      <div className="bg-light-blue w-2/5 p-11">
        <Input placeholder="Enter nickname" type="text" value={nickname} onChange={e => setNickname(e.target.value)} />
        <GamesGallery games={games} />
      </div>
    </div>
  );
};

export default CreateRoom;
