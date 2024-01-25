import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RoomService } from '@services/room.service';
import { useAppDispatch } from '../../store/store';
import { setNickname as setNickname_ } from '../../store/nickname';
import { Input } from '@components/Input';
import GamesGallery from '../../components/GamesGallery';
import { GameService } from '@services/game.service';
import { GamePreviewDto } from '@shared/dto/games/game-preview.dto';

const CreateRoom = () => {
  const [nickname, setNickname] = useState('');
  const [games, setGames] = useState<GamePreviewDto[]>([]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onCreateRoom = async (gameCode?: string) => {
    const roomId = await RoomService.createRoom({
      gameCode,
    });

    dispatch(setNickname_(nickname));
    localStorage.setItem('tt-nickname', nickname);
    navigate(`/room/${roomId}`);
  };

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
        <GamesGallery onGameClick={onCreateRoom} games={games} />
      </div>
    </div>
  );
};

export default CreateRoom;
