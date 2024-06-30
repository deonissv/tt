import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameService } from '@services/game.service';
import { RoomService } from '@services/room.service';
import type { GamePreviewDto } from '@shared/dto/games';
interface Props {
  games: GamePreviewDto[];
}

const GamesGallery: FC<Props> = ({ games }): ReactNode => {
  const navigate = useNavigate();

  const onCreateRoom = async (gameCode: string) => {
    const roomId = await RoomService.createRoom({
      gameCode,
    });

    localStorage.setItem('tt-nickname', '');
    navigate(`/room/${roomId}`);
  };

  const onRemoveGame = async (gameCode: string) => {
    await GameService.removeGame(gameCode);
  };

  return (
    <div className="inline-block">
      {games.map(game => (
        <div
          key={game.code}
          className="w-24 m-1 p-3 text-center border-solid rounded border-black hover:border-2 float-left"
        >
          <img src={game.bannerUrl ?? 'https://www.svgrepo.com/show/126178/question-mark.svg'} alt={game.name} />
          <div>{game.name}</div>
          <button
            className="bg-blue w-full rounded-full mb-1 py-1 text-white text-center"
            onClick={() => onCreateRoom(game.code).catch(console.error)}
          >
            Create
          </button>
          <button
            className="bg-red  w-full rounded-full mb-5 py-1 text-white text-center"
            onClick={() => onRemoveGame(game.code).catch(console.error)}
          >
            Remove
          </button>
        </div>
      ))}
      <div
        className="w-24 mt-3 text-center cursor-pointer border-c-black hover:border-1 float-left"
        onClick={() => {
          navigate('/new');
        }}
      >
        <img src="https://www.svgrepo.com/show/2087/plus.svg"></img>
        <div className="mt-2">New</div>
      </div>
    </div>
  );
};

export default GamesGallery;
