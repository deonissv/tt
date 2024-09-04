import type { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import { GameService } from '@services/game.service';
import { RoomService } from '@services/room.service';
import type { GamePreviewDto } from '@shared/dto/games';
import { isURL } from '@shared/utils';
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
    <div className="inline-block grid md:grid-cols-3 qhd:md:grid-cols-4 gap-4">
      {games.map(game => (
        <div
          key={game.code}
          className="p-2 text-center border-solid rounded border-black hover:outline outline-offset-2 outline-2 float-left"
        >
          <div className="w-full aspect-video">
            {isURL(game.bannerUrl) ? (
              <img
                src={game.bannerUrl ?? 'https://www.svgrepo.com/show/126178/question-mark.svg'}
                alt={game.name}
                className="w-full h-full"
              />
            ) : (
              <VideogameAssetIcon
                sx={{
                  width: '100%',
                  height: '100%',
                  fontSize: '10rem',
                }}
              />
            )}
          </div>

          <div>{game.name}</div>
          <button
            className="bg-blue w-full rounded-full mb-1 py-1 text-white text-center"
            // eslint-disable-next-line no-console
            onClick={() => onCreateRoom(game.code).catch(console.error)}
          >
            Create
          </button>
          <button
            className="bg-red  w-full rounded-full mb-5 py-1 text-white text-center"
            // eslint-disable-next-line no-console
            onClick={() => onRemoveGame(game.code).catch(console.error)}
          >
            Remove
          </button>
        </div>
      ))}
      <div
        className="p-2 text-center border-solid rounded border-black hover:border-2 content-center justify-center place-content-center"
        onClick={() => {
          navigate('/new');
        }}
      >
        <img className="w-4/5 flex justify-center" src="https://www.svgrepo.com/show/2087/plus.svg"></img>
        <div className="mt-2">New</div>
      </div>
    </div>
  );
};

export default GamesGallery;
